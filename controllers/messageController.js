const camelcaseKeys = require('camelcase-keys').default;
const { createMessage, getInboxMessages, getSentMessages, getMessageById, markMessageAsRead } = require('../models/messageModel');
const db = require('../db/connection');

const handleSendMessage = async (req, res) => {
  const sender = req.user;  
  const { recipient_id: recipientId, content } = req.body;
    // Validate request body
  console.log('Received message body:', req.body); 

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [recipientId]);
    const recipient = result.rows[0];

    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found.' });
    }

    if (sender.role === 'user') {

      if (Number(recipient.id) !== Number(sender.manager_id)) {
        return res.status(403).json({ msg: 'Users can only message their assigned manager.' });
      }
    }

    if (sender.role === 'manager') {
      if (recipient.role !== 'user' || recipient.shift !== sender.shift) {
        return res.status(403).json({ msg: 'Managers can only message users in their shift.' });
      }
    }

    const message = await createMessage({
      sender_id: sender.id,
      receiver_id: recipientId,
      content,
      message_type: req.body.message_type || 'personal'
    });

    res.status(201).json({
      msg: 'Message sent successfully.',
      message: camelcaseKeys(message, { deep: true })
    });

  } catch (err) {
    console.error('Message sending error:', err);
    console.log('❌ Full error response:', err.response);
    res.status(500).json({ msg: 'Failed to send message.', error: err.message });
  }
};

const handleGetInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await getInboxMessages(userId);

    console.log('Inbox raw from DB:', messages);

    res.status(200).json({ inbox: camelcaseKeys(messages, { deep: true }) });
  } catch (err) {
    console.error('Inbox error:', err);
    res.status(500).json({ msg: 'Failed to fetch inbox.' });
  }
};

const handleGetSent = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await getSentMessages(userId);

    console.log('Sent raw from DB:', messages);

    res.status(200).json({ sent: camelcaseKeys(messages, { deep: true }) });
  } catch (err) {
    console.error('Sent error:', err);
    res.status(500).json({ msg: 'Failed to fetch sent messages.' });
  }
};


const handleGetMessageById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const message = await getMessageById(id, userId);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    res.status(200).json({ message: camelcaseKeys(message, { deep: true }) });
  } catch (err) {
    console.error('Message details error:', err);
    res.status(500).json({ msg: 'Failed to fetch message details' });
  }
};

const handleMarkAsRead = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const updated = await markMessageAsRead(id);
    res.status(200).json({ success: true, updated });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ msg: 'Failed to mark message as read' });
  }
};

module.exports = {
  handleSendMessage,
  handleGetInbox,
  handleGetSent,
  handleGetMessageById,
  handleMarkAsRead
};