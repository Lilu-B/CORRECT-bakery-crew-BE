DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_shift CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS related_entity_type CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS donations_status CASCADE;

CREATE TYPE user_role AS ENUM ('developer', 'manager', 'user');
CREATE TYPE user_shift AS ENUM ('1st', '2nd', 'night');
CREATE TYPE message_type AS ENUM ('system', 'personal');
CREATE TYPE related_entity_type AS ENUM ('overtime', 'initiative', 'approval', 'payment');
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'expired');
CREATE TYPE donations_status AS ENUM ('active', 'expired');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  shift user_shift,
  is_approved BOOLEAN DEFAULT FALSE,
  registration_date TIMESTAMP DEFAULT NOW(),
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  sent_date TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  message_type message_type NOT NULL,
  related_entity_id INTEGER,
  related_entity_type related_entity_type,
  parent_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE
);

  CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  shift user_shift NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  status event_status DEFAULT 'active'
);

CREATE TABLE event_applications (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL, 
  deadline DATE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  status donations_status DEFAULT 'active'
);

CREATE TABLE donation_applications (
  id SERIAL PRIMARY KEY,
  donation_id INTEGER REFERENCES donations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(donation_id, user_id) 
);

INSERT INTO users (email, password, name, role, is_approved)
VALUES (
  'admin@bakery.local',
  '$2b$10$KFv0iks5SiuLTYjYIIPAW.9klNGqWHsFcxctn1Apr1KeIsmM619iO',   -- Password: 'admin123'
  'Main Admin',
  'developer',
  true
);