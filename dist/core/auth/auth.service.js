"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const fs = require("fs-extra");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const otplib_1 = require("otplib");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const NodeCache = require("node-cache");
const config_service_1 = require("../config/config.service");
const logger_service_1 = require("../logger/logger.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, logger) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = logger;
        this.otpUsageCache = new NodeCache({ stdTTL: 90 });
        this.checkAuthFile();
        otplib_1.authenticator.options = {
            window: 1,
        };
    }
    async authenticate(username, password, otp) {
        try {
            const user = await this.findByUsername(username);
            if (!user) {
                throw new common_1.ForbiddenException();
            }
            await this.checkPassword(user, password);
            if (user.otpActive && !otp) {
                throw new common_1.HttpException('2FA Code Required', 412);
            }
            if (user.otpActive && !this.verifyOtpToken(user, otp)) {
                throw new common_1.HttpException('2FA Code Invalid', 412);
            }
            if (user) {
                return {
                    username: user.username,
                    name: user.name,
                    admin: user.admin,
                    instanceId: this.configService.instanceId,
                };
            }
        }
        catch (e) {
            if (e instanceof common_1.ForbiddenException) {
                this.logger.warn('Failed login attempt');
                this.logger.warn('If you\'ve forgotten your password you can reset to the default ' +
                    `of admin/admin by deleting the "auth.json" file (${this.configService.authPath}) and then restarting Homebridge.`);
                throw e;
            }
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            throw new common_1.ForbiddenException();
        }
    }
    async signIn(username, password, otp) {
        const user = await this.authenticate(username, password, otp);
        const token = await this.jwtService.sign(user);
        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: this.configService.ui.sessionTimeout,
        };
    }
    async checkPassword(user, password) {
        const hashedPassword = await this.hashPassword(password, user.salt);
        if (hashedPassword === user.hashedPassword) {
            return user;
        }
        else {
            throw new common_1.ForbiddenException();
        }
    }
    async generateNoAuthToken() {
        if (this.configService.ui.auth !== 'none') {
            throw new common_1.UnauthorizedException();
        }
        const users = await this.getUsers();
        const user = users.find(x => x.admin === true);
        const token = await this.jwtService.sign({
            username: user.username,
            name: user.name,
            admin: user.admin,
            instanceId: this.configService.instanceId,
        });
        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: this.configService.ui.sessionTimeout,
        };
    }
    async validateUser(payload) {
        return payload;
    }
    async verifyWsConnection(client) {
        try {
            return jwt.verify(client.handshake.query.token, this.configService.secrets.secretKey);
        }
        catch (e) {
            client.disconnect();
            throw new websockets_1.WsException('Unauthorized');
        }
    }
    async hashPassword(password, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    return reject(err);
                return resolve(derivedKey.toString('hex'));
            });
        });
    }
    async genSalt() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err)
                    return reject(err);
                return resolve(buf.toString('hex'));
            });
        });
    }
    async setupFirstUser(user) {
        if (this.configService.setupWizardComplete) {
            throw new common_1.ForbiddenException();
        }
        if (!user.password) {
            throw new common_1.BadRequestException('Password missing.');
        }
        user.admin = true;
        await fs.writeJson(this.configService.authPath, []);
        const createdUser = await this.addUser(user);
        this.configService.setupWizardComplete = true;
        return createdUser;
    }
    async generateSetupWizardToken() {
        if (this.configService.setupWizardComplete !== false) {
            throw new common_1.ForbiddenException();
        }
        const token = await this.jwtService.sign({
            username: 'setup-wizard',
            name: 'setup-wizard',
            admin: true,
            instanceId: 'xxxxx',
        }, { expiresIn: '5m' });
        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: 300,
        };
    }
    async checkAuthFile() {
        if (!await fs.pathExists(this.configService.authPath)) {
            this.configService.setupWizardComplete = false;
            return;
        }
        try {
            const authfile = await fs.readJson(this.configService.authPath);
            if (!authfile.find(x => x.admin === true)) {
                this.configService.setupWizardComplete = false;
            }
        }
        catch (e) {
            this.configService.setupWizardComplete = false;
        }
    }
    desensitiseUserProfile(user) {
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            admin: user.admin,
            otpActive: user.otpActive || false,
        };
    }
    async getUsers(strip) {
        const users = await fs.readJson(this.configService.authPath);
        if (strip) {
            return users.map(this.desensitiseUserProfile);
        }
        return users;
    }
    async findById(id) {
        const users = await this.getUsers();
        const user = users.find(x => x.id === id);
        return user;
    }
    async findByUsername(username) {
        const users = await this.getUsers();
        const user = users.find(x => x.username === username);
        return user;
    }
    async saveUserFile(users) {
        return await fs.writeJson(this.configService.authPath, users, { spaces: 4 });
    }
    async addUser(user) {
        const authfile = await this.getUsers();
        const salt = await this.genSalt();
        const newUser = {
            id: authfile.length ? Math.max(...authfile.map(x => x.id)) + 1 : 1,
            username: user.username,
            name: user.name,
            hashedPassword: await this.hashPassword(user.password, salt),
            salt,
            admin: user.admin,
        };
        if (authfile.find(x => x.username.toLowerCase() === newUser.username.toLowerCase())) {
            throw new common_1.ConflictException(`User with username '${newUser.username}' already exists.`);
        }
        authfile.push(newUser);
        await this.saveUserFile(authfile);
        this.logger.warn(`Added new user: ${user.username}`);
        return this.desensitiseUserProfile(newUser);
    }
    async deleteUser(id) {
        const authfile = await this.getUsers();
        const index = authfile.findIndex(x => x.id === id);
        if (index < 0) {
            throw new common_1.BadRequestException('User Not Found');
        }
        if (authfile[index].admin && authfile.filter(x => x.admin === true).length < 2) {
            throw new common_1.BadRequestException('Cannot delete only admin user');
        }
        authfile.splice(index, 1);
        await this.saveUserFile(authfile);
        this.logger.warn(`Deleted user with ID ${id}`);
    }
    async updateUser(id, update) {
        const authfile = await this.getUsers();
        const user = authfile.find(x => x.id === id);
        if (!user) {
            throw new common_1.BadRequestException('User Not Found');
        }
        if (user.username !== update.username) {
            if (authfile.find(x => x.username.toLowerCase() === update.username.toLowerCase())) {
                throw new common_1.ConflictException(`User with username '${update.username}' already exists.`);
            }
            this.logger.log(`Updated user: Changed username from '${user.username}' to '${update.username}'`);
            user.username = update.username;
        }
        user.name = update.name || user.name;
        user.admin = (update.admin === undefined) ? user.admin : update.admin;
        if (update.password) {
            const salt = await this.genSalt();
            user.hashedPassword = await this.hashPassword(update.password, salt);
            user.salt = salt;
        }
        this.saveUserFile(authfile);
        this.logger.log(`Updated user: ${user.username}`);
        return this.desensitiseUserProfile(user);
    }
    async updateOwnPassword(username, currentPassword, newPassword) {
        const authfile = await this.getUsers();
        const user = authfile.find(x => x.username === username);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        await this.checkPassword(user, currentPassword);
        const salt = await this.genSalt();
        user.hashedPassword = await this.hashPassword(newPassword, salt);
        user.salt = salt;
        await this.saveUserFile(authfile);
        return this.desensitiseUserProfile(user);
    }
    async setupOtp(username) {
        const authfile = await this.getUsers();
        const user = authfile.find(x => x.username === username);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (user.otpActive) {
            throw new common_1.ForbiddenException('2FA has already been activated.');
        }
        user.otpSecret = otplib_1.authenticator.generateSecret();
        await this.saveUserFile(authfile);
        const appName = `Homebridge UI (${this.configService.instanceId.slice(0, 7)})`;
        return {
            timestamp: new Date(),
            otpauth: otplib_1.authenticator.keyuri(user.username, appName, user.otpSecret),
        };
    }
    async activateOtp(username, code) {
        const authfile = await this.getUsers();
        const user = authfile.find(x => x.username === username);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (!user.otpSecret) {
            throw new common_1.BadRequestException('2FA has not been setup.');
        }
        if (otplib_1.authenticator.verify({ token: code, secret: user.otpSecret })) {
            user.otpActive = true;
            await this.saveUserFile(authfile);
            this.logger.warn(`Activated 2FA for '${user.username}'.`);
            return this.desensitiseUserProfile(user);
        }
        else {
            throw new common_1.BadRequestException('2FA code is not valid.');
        }
    }
    async deactivateOtp(username, password) {
        const authfile = await this.getUsers();
        const user = authfile.find(x => x.username === username);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        await this.checkPassword(user, password);
        user.otpActive = false;
        delete user.otpSecret;
        await this.saveUserFile(authfile);
        this.logger.warn(`Deactivated 2FA for '${username}'.`);
        return this.desensitiseUserProfile(user);
    }
    verifyOtpToken(user, otp) {
        const otpCacheKey = user.username + otp;
        if (this.otpUsageCache.get(otpCacheKey)) {
            this.logger.warn(`[${user.username}] attempted to reuse one-time-password.`);
            return false;
        }
        if (otplib_1.authenticator.verify({ token: otp, secret: user.otpSecret })) {
            this.otpUsageCache.set(otpCacheKey, 'true');
            return true;
        }
        return false;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_service_1.ConfigService,
        logger_service_1.Logger])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map