import { UserRepository } from '../repositories/UserRepository';
import { User } from '../interfaces';
import { postgres } from '../db/postgres';

class UserModel {
  private userRepository: UserRepository;
  private postgres: typeof postgres;

  constructor(userRepository: UserRepository, postgres: typeof postgres) {
    this.userRepository = userRepository;
    this.postgres = postgres;
  }

  async createUser(newUser: User): Promise<User> {
    try {
      // TODO: consider Adding a check for user role here, might affect permissions
      if (!newUser.id || !newUser.name || !newUser.email) {
        throw new Error('Invalid user data');
      }

      const existingUser = await this.getUserByEmail(newUser.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // console.log('Creating new user:', newUser); // debug
      const createdUser = await this.userRepository.createUser(newUser);
      // console.log('Created user:', createdUser); // debug
      return createdUser;
    } catch (error) {
      // NOTE: we should log this error for auditing purposes
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUserByEmail(emailAddress: string): Promise<User | null> {
    try {
      const user = await this.userRepository.getUserByEmail(emailAddress);
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  async updateUser(userId: number, updatedUserInfo: User): Promise<User> {
    try {
      if (!userId || !updatedUserInfo.name || !updatedUserInfo.email) {
        throw new Error('Invalid user data');
      }

      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // FIXME: need to add validation for updateduserinfo
      const updatedUser = await this.userRepository.updateUser(userId, updatedUserInfo);
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // TODO: add a soft delete option here, rather than permanent delete
      await this.userRepository.deleteUser(userId);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      // console.log('Getting user by id:', userId); // debug
      const user = await this.userRepository.getUserById(userId);
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by id: ${error.message}`);
    }
  }

  async authenticateUser(emailAddress: string, password: string): Promise<boolean> {
    // TODO: Implement user authentication using a library like passport.js
    return true;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const userPermissions = await this.userRepository.getUserPermissions(userId);
      // console.log('User permissions:', userPermissions); // debug
      return userPermissions;
    } catch (error) {
      throw new Error(`Failed to get user permissions: ${error.message}`);
    }
  }
}

export { UserModel };
