import { UserDto } from '../users/users.dto';
import { AuthService } from '../../core/auth/auth.service';
export declare class SetupWizardController {
    private authService;
    constructor(authService: AuthService);
    setupFirstUser(body: UserDto): Promise<UserDto>;
    generateSetupWizardToken(): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
}
