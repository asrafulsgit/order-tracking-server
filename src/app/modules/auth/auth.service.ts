// src/app/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateTokenPair, verifyRefreshToken } from "../../utils/jwt.utils";
import { env } from "../../config/env.config";
import type {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
} from "./auth.validation";

// ─── Safe user select (never expose password) ─────────────────────────────────
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  created_at: true,
  updated_at: true,
} as const;

// ─── Register ──────────────────────────────────────────────────────────────────
export async function register(dto: RegisterDto) {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existingUser)
    throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(
    dto.password,
    env.BCRYPT_SALT_ROUNDS,
  );

  const user = await prisma.user.create({
    data: { name: dto.name, email: dto.email, password: hashedPassword },
    select: safeUserSelect,
  });

  return user;
}

// ─── Login ─────────────────────────────────────────────────────────────────────
export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  if (!isPasswordValid)
    throw ApiError.unauthorized("Invalid email or password");

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, tokens };
}

// ─── Refresh Token ─────────────────────────────────────────────────────────────
// export async function refreshTokens(token: string) {
//   const payload = verifyRefreshToken(token);

//   const user = await prisma.user.findUnique({ where: { id: payload.sub } });

//   const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });

//   await prisma.user.update({
//     where: { id: user.id },
//     data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
//   });

//   return tokens;
// }

// ─── Logout ────────────────────────────────────────────────────────────────────
export async function logout(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

// ─── Get Profile ───────────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: safeUserSelect,
  });
  return user;
}

// ─── Change Password ───────────────────────────────────────────────────────────
export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const isValid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isValid) throw ApiError.badRequest("Current password is incorrect");

  if (dto.currentPassword === dto.newPassword) {
    throw ApiError.badRequest(
      "New password must be different from current password",
    );
  }

  const hashedPassword = await bcrypt.hash(
    dto.newPassword,
    env.BCRYPT_SALT_ROUNDS,
  );

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, refreshToken: null },
  });
}
