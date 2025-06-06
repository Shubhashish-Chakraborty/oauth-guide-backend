import { Request, Response } from 'express';
import { JWT_USER_SECRET } from '../config';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';

export const me = async (req: Request, res: Response) => {
    try {
        if (!(req as any).user) {
            res.status(401).json({
                message: "ACCESS DENIED"
            })
            return
        }

        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            res.status(400).json({
                message: "Sorry User Not Found!"
            })
            return
        }

        const finalUserData = {
            username: user?.username,
            email: user?.email,
            contactNumber: user?.contactNumber,
            userAddedAt: user?.UserAddedAt
        }

        res.status(200).json({
            finalUserData
        })

    } catch (error) {
        res.status(500).json({
            message: 'Something Went Wrong, Please Try Again Later',
            error
        });
    }
}

export const session = async (req: Request, res: Response) => {
    try {
        // Get token from cookies or Authorization header
        // const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1] || req.query.token;

        if (!token) {
            res.status(200).json({
                message: {
                    isAuthenticated: false,
                    user: null
                }
            });
            return
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_USER_SECRET) as { id: string, email: string };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                provider: true
            }
        });

        if (!user) {
            res.status(200).json({
                message: {
                    isAuthenticated: false,
                    user: null
                }
            });
            return
        }

        res.status(200).json({
            message: {
                isAuthenticated: true,
                user: user
            }
        });
        return
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(200).json({
            message: {
                isAuthenticated: false,
                user: null
            }
        });
        return
    }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
        res.status(200).json({
            message: "User Logged Out Successfully!"
        });
        return
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            error: "Something went wrong while logging out."
        });
        return
    }
};