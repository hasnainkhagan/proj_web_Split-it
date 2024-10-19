import express from "express"
import { changeEmail, changePassword, changeUsername, getUserData, logIn, requestResetPassword, signUp, verifySessionToken } from "../controllers/auth.js";
import {signToken, verifyToken} from '../middlewares/authMiddleware.js'
import { checkOtp, generateOtp } from "../controllers/otp.js";

export const Router = express.Router();

// Auth
Router.route('/auth/signup').post(signUp);
Router.route('/auth/login').post(signToken, logIn);
Router.route('/auth/userData').get(verifyToken, getUserData);
Router.route('/auth/reqResetPass').get(requestResetPassword);
Router.route('/auth/verifySession').get(verifySessionToken);
Router.route('/auth/changePass').post(changePassword);
Router.route('/auth/changeUsername').post(verifyToken, changeUsername);
Router.route('/auth/changeEmail').post(verifyToken, signToken, changeEmail);
Router.route('/auth/generateOtp').post(verifyToken, generateOtp);
Router.route('/auth/checkOtp').get(verifyToken, checkOtp);

// Bills
