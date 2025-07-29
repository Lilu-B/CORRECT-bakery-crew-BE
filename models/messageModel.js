const db = require('../db/connection');

const createMessage = async ({
  sender_id,
  receiver_id,
  content,
  message_type = 'personal',
  related_entity_id = null,
  related_entity_type = null
}) => {
  const result = await db.query(
    `
    INSERT INTO messages (
      sender_id,
      receiver_id,
      content,
      message_type,
      related_entity_id,
      related_entity_type
    )
    VALUES ($1, $2, $3, $4::message_type, $5, $6::related_entity_type)
    RETURNING *;
    `,
    [
      sender_id,
      receiver_id,
      content,
      message_type,
      related_entity_id,
      related_entity_type
    ]
  );

  return result.rows[0];
};

const getInboxMessages = async (userId) => {
  const result = await db.query(
    `
    SELECT m.*, 
           s.name AS sender_name,
           r.name AS receiver_name
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE m.receiver_id = $1
    ORDER BY m.sent_date DESC;
    `,
    [userId]
  );
  return result.rows;
};

const getSentMessages = async (userId) => {
  const result = await db.query(
    `
    SELECT m.*, 
           s.name AS sender_name,
           r.name AS receiver_name
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE m.sender_id = $1
    ORDER BY m.sent_date DESC;
    `,
    [userId]
  );
  return result.rows;
};

const getMessageById = async (id, userId) => {
  const result = await db.query(
    `
    SELECT m.*, 
           s.name AS sender_name,
           r.name AS receiver_name
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE m.id = $1 AND (m.sender_id = $2 OR m.receiver_id = $2)
    `,
    [id, userId]
  );
  return result.rows[0];
};

const markMessageAsRead = async (id) => {
  const result = await db.query(
    `UPDATE messages SET is_read = true WHERE id = $1 RETURNING *;`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createMessage,
  getInboxMessages,
  getSentMessages,
  markMessageAsRead,
  getMessageById
};