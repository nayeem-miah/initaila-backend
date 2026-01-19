
import config from "../../config";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";

import { jwtHelper } from "../../utils/JwtHelper";
import bcrypt from 'bcrypt'


const login = async (payload: { email: string, password: string }) => {

    console.log(payload);

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    })

    if (!user || !user.password) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);

    if (!isCorrectPassword) {
        throw new ApiError(401, "Invalid credentials");
    }


    const accessToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.accessToken as string,
        config.jwt.accessTokenExpiresIn as string
    );
    const refreshToken = jwtHelper.generateToken(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.refreshToken as string,
        config.jwt.refreshTokenExpiresIn as string
    );


    return {
        accessToken,
        refreshToken,

    }
}


export const AuthServices = {
    login
}