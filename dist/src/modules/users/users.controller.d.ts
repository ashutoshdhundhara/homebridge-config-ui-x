import { AuthService } from '../../core/auth/auth.service';
import { UserDto, UserUpdatePasswordDto, UserActivateOtpDto, UserDeactivateOtpDto } from './users.dto';
export declare class UsersController {
    private authService;
    constructor(authService: AuthService);
    getUsers(): Promise<UserDto[]>;
    addUser(body: UserDto): Promise<UserDto>;
    updateUser(userId: number, body: UserDto): Promise<UserDto>;
    deleteUser(userId: number): Promise<void>;
    updateOwnPassword(req: any, body: UserUpdatePasswordDto): Promise<UserDto>;
    setupOtp(req: any): Promise<{
        timestamp: Date;
        otpauth: string;
    }>;
    activateOtp(req: any, body: UserActivateOtpDto): Promise<UserDto>;
    deactivateOtp(req: any, body: UserDeactivateOtpDto): Promise<UserDto>;
}
