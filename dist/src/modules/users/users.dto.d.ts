export declare class UserDto {
    id?: number;
    name: string;
    username: string;
    admin: boolean;
    password?: string;
    hashedPassword?: string;
    salt?: string;
    otpSecret?: string;
    otpActive?: boolean;
}
export declare class UserUpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UserActivateOtpDto {
    code: string;
}
export declare class UserDeactivateOtpDto {
    password: string;
}
