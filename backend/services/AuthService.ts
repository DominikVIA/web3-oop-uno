import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface User {
    id: string;
    username: string;
}

interface InternalUser extends User {
    passwordHash: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'uno-super-secret-key-2026';

export class AuthService {
    private users = new Map<string, InternalUser>();

    async register(username: string, password: string): Promise<{ token: string; user: User }> {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        if (this.users.has(username)) {
            throw new Error('Username is already taken');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser: InternalUser = {
            id: username,
            username,
            passwordHash
        };

        this.users.set(username, newUser);

        const userPayload: User = {id: newUser.id, username: newUser.username};
        const token = jwt.sign(userPayload, JWT_SECRET, {expiresIn: '7d'});

        return {token, user: userPayload};
    }

    async login(username: string, password: string): Promise<{ token: string; user: User }> {
        const user = this.users.get(username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        const userPayload: User = {id: user.id, username: user.username};
        const token = jwt.sign(userPayload, JWT_SECRET, {expiresIn: '7d'});

        return {token, user: userPayload};
    }

    verifyToken(token: string | undefined): User | null {
        try {
            if (!token) return null;
            const cleanToken = token.replace('Bearer ', '');
            const decoded = jwt.verify(cleanToken, JWT_SECRET) as User;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}