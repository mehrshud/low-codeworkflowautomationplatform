// src/repositories/UserRepository.ts

import { User } from '../models/User';
import { db } from '../db/postgres';
import { DEFAULT_TIMEOUT } from '../config';

// UserRepository: encapsulates database operations for User entity
class UserRepository {
  // Create a new User record in the database
  async createUser(user: User): Promise<User> {
    try {
      // Insert the new user into the database
      const result = await db.query(
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
        [user.name, user.email]
      );
      return result.rows[0] as User;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve a User by ID
  async getUserById(id: number): Promise<User | null> {
    try {
      const result = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
      return result.rows[0] as User | null;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve all Users (with pagination)
  async getUsers(limit: number = 10, offset: number = 0): Promise<User[]> {
    try {
      // TODO: add filtering and sorting capabilities
      const result = await db.query(
        `SELECT * FROM users LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows as User[];
    } catch (error) {
      throw error;
    }
  }

  // Update an existing User record
  async updateUser(id: number, user: User): Promise<User | null> {
    try {
      const result = await db.query(
        `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
        [user.name, user.email, id]
      );
      return result.rows[0] as User | null;
    } catch (error) {
      throw error;
    }
  }

  // Delete a User record by ID
  async deleteUser(id: number): Promise<void> {
    try {
      // TODO: add foreign key deletion for associated workflows
      await db.query(`DELETE FROM users WHERE id = $1`, [id]);
    } catch (error) {
      throw error;
    }
  }

  // Helper function: check if a user exists (used for authorization)
  async userExists(id: number): Promise<boolean> {
    const user = await this.getUserById(id);
    return user !== null;
  }

  // Helper function: get the user's email address
  async getUserEmail(id: number): Promise<string | null> {
    const user = await this.getUserById(id);
    return user?.email ?? null;
    // FIXME: handle case when user is null
  }
}

export { UserRepository };
