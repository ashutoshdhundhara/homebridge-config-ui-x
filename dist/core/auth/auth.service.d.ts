import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { Logger } from '../logger/logger.service';
import { UserDto } from '../../modules/users/users.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private otpUsageCache;
    constructor(jwtService: JwtService, configService: ConfigService, logger: Logger);
    authenticate(username: string, password: string, otp?: string): Promise<any>;
    signIn(username: string, password: string, otp?: string): Promise<any>;
    private checkPassword;
    generateNoAuthToken(): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    validateUser(payload: any): Promise<any>;
    verifyWsConnection(client: any): Promise<string | jwt.JwtPayload>;
    private hashPassword;
    private genSalt;
    setupFirstUser(user: UserDto): Promise<UserDto>;
    generateSetupWizardToken(): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    checkAuthFile(): Promise<void>;
    desensitiseUserProfile(user: UserDto): UserDto;
    getUsers(strip?: boolean): Promise<UserDto[]>;
    findById(id: number): Promise<UserDto>;
    findByUsername(username: string): Promise<UserDto>;
    private saveUserFile;
    addUser(user: any): Promise<UserDto>;
    deleteUser(id: number): Promise<void>;
    updateUser(id: number, update: UserDto): Promise<UserDto>;
    updateOwnPassword(username: any, currentPassword: string, newPassword: string): Promise<UserDto>;
    setupOtp(username: string): Promise<{
        timestamp: Date;
        otpauth: string;
    }>;
    activateOtp(username: string, code: string): Promise<UserDto>;
    deactivateOtp(username: string, password: string): Promise<UserDto>;
    verifyOtpToken(user: UserDto, otp: string): boolean;
}
