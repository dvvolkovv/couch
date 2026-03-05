import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  Matches,
  Length,
} from 'class-validator';

export class RegisterEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEnum(['CLIENT', 'SPECIALIST'])
  role: 'CLIENT' | 'SPECIALIST';

  @IsBoolean()
  privacyAccepted: boolean;

  @IsBoolean()
  termsAccepted: boolean;
}

export class RegisterPhoneDto {
  @IsString()
  @Matches(/^\+7\d{10}$/, { message: 'Phone must be in +7XXXXXXXXXX format' })
  phone: string;

  @IsEnum(['CLIENT', 'SPECIALIST'])
  role: 'CLIENT' | 'SPECIALIST';
}

export class VerifyPhoneDto {
  @IsString()
  @Matches(/^\+7\d{10}$/)
  phone: string;

  @IsString()
  @Length(4, 4)
  code: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class LoginEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginPhoneDto {
  @IsString()
  @Matches(/^\+7\d{10}$/)
  phone: string;
}

export class OAuthGoogleDto {
  @IsString()
  idToken: string;
}

export class OAuthVkDto {
  @IsString()
  code: string;

  @IsString()
  redirectUri: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
