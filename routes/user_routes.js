require("dotenv").config();
const express = require("express");

const User = require("../models/user");
const UserRoute = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticate = require("../middleware/authcheck");
const generateAccessToken = require("../helper/generateAccessToken");
const checkNumber = require("../helper/checkNumber");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();
const sendNotification = require("../helper/sendNotification");

const RoleModuleUser = require("../models/role_module_user");
const { result } = require("lodash");
const RoleModule = require("../models/role_module");
const moment = require("moment");
const Role = require("../models/role");

/**
 * This method is to get list of User details
 */
UserRoute.get("/list", async (req, res) => {
    try {
        const UserData = await User.find({is_deleted:false}).populate([
            {
                path: "organization",
                select: "uniqueId name email phone"
            },
            {
                path: "role",
                select: "name"
            }
        ]).sort({_id:-1});

        let customUserData = JSON.parse(JSON.stringify(UserData))

		customUserData.map(e => {
			e.organization_name =  e.organization?.name;
			e.created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Users list",
            data: customUserData,
        };
        infoLogger.info({
			req: req.params, 
			res: customUserData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch (err) {
        errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to get list of User details
 */
UserRoute.get("/social-worker/list", async (req, res) => {
    try {
        let RoleData = await Role.findOne({$and: [{name: {$regex: "social worker", $options: "i"}}, {is_deleted: false}]}).sort({_id:-1});

        const UserData = await User.find({role: RoleData._id}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "organization",
                select: "name"
            }
        ]);

        let customUserData = JSON.parse(JSON.stringify(UserData))

		customUserData.map(e => {
			e.organization_name =  e.organization?.name;
			e.created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Users list",
            data: customUserData,
        };
        infoLogger.info({
			req: req.body, 
			res: {customUserData, RoleData}, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create new User
 */
UserRoute.post("/create", async (req, res) => {
    try {

        const UserExist = await User.findOne({
            $or: [{email: req.body.email}, {mobile: req.body.mobile}]
        });

        if (UserExist && UserExist.email == req.body.email) {
            message = {
                error: true,
                message: "Email already exist!"
            };
            errorLogger.error({
                req: req.body, 
                res: UserExist, 
                method:"POST", 
                url: req.originalUrl, 
                error: true
            });
        } else if (UserExist && UserExist.mobile == req.body.mobile) {
            message = {
                error: true,
                message: "Mobile number already exist!"
            };
            errorLogger.error({
                req: req.body, 
                res: UserExist, 
                method:"POST", 
                url: req.originalUrl, 
                error: true
            });
        } else {
            req.body.password = 'secret'; 
            const UserData = new User(req.body);
            const result = await UserData.save();
            message = {
                error: false,
                message: "User Added Successfully!",
                data: result
            };
            infoLogger.info({
                req: req.body, 
                res: result, 
                method:"POST", 
                url: req.originalUrl, 
                error: false
            });
        }
        
        return res.status(200).send(message);
        
        
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: String(err),
            data: String(err)
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to get details of User
 * @param str UserId
 */
UserRoute.get("/detail/:UserId", async (req, res) => {
    try {
        const UserData = await User.findOne({_id: req.params.UserId}).populate([
            {
                path: "organization",
                select: "uniqueId name email phone"
            },
            {
                path: "role",
                select: "name"
            },
            {
                path: "block",
                select: "name"
            },
            {
                path: "district",
                select: "name"
            },
            {
                path: "state",
                select: "name"
            }
        ]);

        if (UserData) {
            messageData = {
                error: false, 
                message: 'User data found', 
                data: UserData
            }
            infoLogger.info({
                req: req.params, 
                res: UserData, 
                method:"GET", 
                url: req.originalUrl, 
                error: false
            });
        } 
        else {
            messageData = {
                error: true, 
                message: 'No data found'
            }
        }
        errorLogger.error({
            req: req.body, 
            res: {}, 
            method:"GET", 
            url: req.originalUrl, 
            error: true
        });
        return res.status(200).send(messageData)
    } catch (error) {
        errorLogger.error({
			req: req.body, 
			res: error, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: 'Operation failed!',
            data: error
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to set update User details
 * @param str UserId
 */
UserRoute.patch("/update-profile/:UserId", isAuthenticate, async (req, res) => {
    try {
        delete req.body.email;
        delete req.body.mobile;
        delete req.body.password;
        const result = await User.findOneAndUpdate({
            _id: req.params.UserId
        }, req.body, {
            new: true
        });
        result.password = ''
        if (result) {

            if (req.params.UserId) {
                let sendNotificationData = await sendNotification({
                    user: req.params.UserId,
                    title: "User Profile Update",
                    description: "Profile details for user "+ result?.userNo +" updated successfully"
                });
            }

            message = {
                error: false,
                message: "Profile Updated Successfully!",
                data: result
            };
            infoLogger.info({
				req: req.body, 
				res: JSON.stringify(result), 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Not found!"
            };
            errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
            return res.status(200).send(message);
        }
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: String(err),
            data: err,
        };
        return res.status(200).send(message);
    }
});


/**
 * This method is to set update User details
 * @param str UserId
 */
 UserRoute.patch("/terms-and-conditions/:UserId", isAuthenticate, async (req, res) => {
    try {
        const result = await User.findOneAndUpdate({
            _id: req.params.UserId
        }, {terms_and_conditions: req.body.terms_and_conditions}, {
            new: true
        });
        if (result) {
            if (req.params.UserId) {
                let sendNotificationData = await sendNotification({
                    user: req.params.UserId,
                    title: "User Profile Update",
                    description: "Profile details for user "+ result?.userNo +" updated successfully"
                });
            }

            message = {
                error: false,
                message: "Profile Updated Successfully!",
                terms_and_conditions: req.body.terms_and_conditions
            };
            infoLogger.info({
				req: req.body, 
				res: JSON.stringify(result), 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
            return res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Not found!"
            };
            errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
            return res.status(200).send(message);
        }
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to change password of User
 * @param str UserId
 */
UserRoute.patch("/change-password/:UserId", isAuthenticate, async (req, res) => {
    try {
        if (req.body.old_password && req.body.new_password) {
            if (req.body.old_password === req.body.new_password) {
                message = {
                    error: true,
                    message: "Old and new password can not be same"
                }
                return res.status(200).send(message);
            }
            const UserData = await User.findOne({
                _id: req.params.UserId
            });
            if (UserData === null) {
                message = {
                    error: true,
                    message: "User not found!"
                }
            } else {
                passwordCheck = await bcrypt.compare(req.body.old_password, UserData.password);
                if (passwordCheck) {
                    const result = await User.findOneAndUpdate({
                        _id: req.params.UserId
                    }, {
                        password: req.body.new_password
                    });

                    if (req.params.UserId) {
                        let sendNotificationData = await sendNotification({
                            user: req.params.UserId,
                            title: "User Password Change",
                            description: "Password of user "+ result?.userNo + " changed successfully."
                        });
                    }

                    message = {
                        error: false,
                        message: "User password updated!"
                    }
                } else {
                    message = {
                        error: true,
                        message: "Old password is not correct!"
                    }
                }
            }
        } else {
            message = {
                error: true,
                message: "Old password, new password are required!"
            }
        }
        return res.status(200).send(message);
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(500).send(message);
    }
});

/**
 * This method is to forget password of a User
 * @param str email || @param number mobile || @param str username
 */
// UserRoute.patch("/forget-password", async (req, res) => {
// 	try {
// 		if (req.body.user) {
//             const randomPassword = Math.random().toString(36).slice(2);
//             const UserData = await User.findOneAndUpdate({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) }, { username: req.body.user } ]}, { password: randomPassword }, {new:true});
//             if (UserData === null) {
//                 message = {
//                     error: true,
//                     message: "User not found!"
//                 }
//                 return res.status(200).send(message);
//             } else {
//                 message = {
//                     error: false,
//                     message: "User password updated!",
//                     updatedPassword: randomPassword,
//                 }
//                 return res.status(200).send(message);
//             }
//         } else {
//             message = {
//                 error: true,
//                 message: "Email is required"
//             }
//             return res.status(200).send(message);
//         }
// 	} catch (err) {
// 		message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: err,
// 		};
// 		res.status(200).send(message);
// 	}
// });

/**
 * This method is to get otp
 * @param str email || @param number mobile || @param str username
 */
UserRoute.post("/forget-password", async (req, res) => {
	try {
        const userExisted = await User.findOne({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) } ]});

        if (userExisted) {
			const otpData = {
				emailOtp: 1234,
			}
			const result = await User.updateOne({ _id: userExisted._id }, otpData);
			
            message = {
                error: false,
                message: "Otp received!",
				data: otpData
            };
        } else {
            message = {
                error: true,
                message: "User not found!",
                data: result,
            };
        }
        res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});



/**
 * This method is to verify otp
 * @param str email || @param number mobile || @param str username
 */
 UserRoute.post("/verify-otp", async (req, res) => {
	try {
        if(req.body.user && req.body.otp){
            const UserData = await User.findOne({$and:[{email:req.body.user},{emailOtp:req.body.otp}]});
            if(UserData == null){
               message = {
                error:true,
                message:"otp not verified"
               }
               return res.status(200).send(message);
            }else{
                message = {
                    error:false,
                    message:"otp verified",
                   }
            }
            return res.status(200).send(message);
        }
      
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});



/**
 * This method is to reset password of a User
 * @param str email || @param number mobile || @param str username
 * @param number otp
 */

UserRoute.patch("/reset-password", async (req, res) => {
    try {
        if (req.body.new_password && req.body.confirm_password) {
            if (req.body.new_password !== req.body.confirm_password) {
                message = {
                    error: true,
                    message: "new and confirm password are not equal"
                }
                return res.status(200).send(message);
            }
            const UserData = await User.findOne({
                email: req.body.email
            });
           
            if (UserData === null) {
                message = {
                    error: true,
                    message: "User not found!"
                }
            } else {
                    const result = await User.findOneAndUpdate({
                        email: req.body.email
                    }, {
                        password: req.body.new_password
                    });

                   console.log("result",result);
                    

                    if (req.params.UserId) {
                        let sendNotificationData = await sendNotification({
                            user: req.params.UserId,
                            title: "User Password Change",
                            description: "Password of user "+ result?.userNo + " changed successfully."
                        });
                    }

                    message = {
                        error: false,
                        message: "User password reset!"
                    }
            }
        } else {
            message = {
                error: true,
                message: "new password, confirm password are required!"
            }
        }
        return res.status(200).send(message);
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(500).send(message);
    }
});




/**
 * This method is to login a User
 * @param str email
 * @param str password
 */
UserRoute.post("/login", async (req, res) => {
    try {
        if (req.body.user && req.body.password) {
            UserData = await User.findOneAndUpdate({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) }, { username: req.body.user } ]}, {last_login_time: Date.now()}).populate(
                [
                    {
                        path: "organization",
                        select: "uniqueId name email phone"
                    },
                    {
                        path: "role",
                        select: "name"
                    },
                    {
                        path: "block",
                        select: "name"
                    },
                    {
                        path: "district",
                        select: "name"
                    },
                    {
                        path: "state",
                        select: "name"
                    }
                ]
            );
            if (UserData === null) {
                message = {
                    error: true,
                    message: "Invalid email, please enter valid email Id"
                }
                return res.status(200).send(message);
            } else {
                passwordCheck = await bcrypt.compare(req.body.password, UserData.password);
                if (passwordCheck) {
                    if (UserData.is_deleted === false) {
                        //generate access and refresh token
                        UserData.password = "";
                        const user = {
                            data: UserData
                        };
                        const accessToken = await generateAccessToken(user);
                        const refreshToken = await jwt.sign(user, process.env.REFRESH_TOKEN_KEY);
                        let userAccess = await RoleModule.findOne({role: UserData?.role?._id}).populate([
                            {
                                path:"access.module",
                                select:"name"
                            }
                        ]);
                        //console.log(userAccess);
                            message = {
                            error: false,
                            message: "User logged in!",
                            data: [UserData, {
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            }],
                            userAccess,
                            terms_and_conditions: UserData?.terms_and_conditions ||false,
                            //accessData:RoleModuleUser?.access
                        }
                        return res.status(200).send(message);
                    } else {
                        message = {
                            error: true,
                            message: "User is no longer exist!"
                        }
                        return res.status(200).send(message);
                    }
                } else {
                    message = {
                        error: true,
                        message: "wrong password!"
                    }
                    return res.status(200).send(message);
                }
            }
            
        } else {
            res.status(403).send({
                message: "Email and Password are required.",
            });
        }

    }catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to login a User with OTP
 * @param str email
 * @param int mobileOtp
 */
UserRoute.post("/login-with-otp", async (req, res) => {
    try {
        if (req.body.user && req.body.otp) {
            UserData = await User.findOne({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) }]});
            if (UserData === null) {
                message = {
                    error: true,
                    message: "User does not exist"
                }
                return res.status(200).send(message);
            } else {
                if (req.body.otp === UserData.mobileOtp || req.body.otp === UserData.emailOtp) {
                    if (UserData.status === true) {
                        //generate access and refresh token
                        // UserData.password = "";
                        const user = {
                            data: UserData
                        };
                        const accessToken = await generateAccessToken(user);
                        const refreshToken = await jwt.sign(user, process.env.REFRESH_TOKEN_KEY);

                        message = {
                            error: false,
                            message: "User logged in!",
                            data: [UserData, {
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            }]
                        }
                        return res.status(200).send(message);
                    } else {
                        message = {
                            error: true,
                            message: "User is in active!"
                        }
                        return res.status(403).send(message);
                    }
                } else {
                    message = {
                        error: true,
                        message: "wrong otp!"
                    }
                    return res.status(200).send(message);
                }
            }
        } else {
            res.status(403).send({
                message: "Email and OTP are required.",
            });
        }
    } catch (err) {
        message = {
            error: true,
            message: String(err),
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to delete User
 * @param str UserId
 */
UserRoute.delete("/delete/:UserId", async (req, res) => {
    try {
        const result = await User.deleteOne({
            _id: req.params.UserId
        });
        if (result.deletedCount == 1) {
            message = {
                error: false,
                message: "User deleted successfully!",
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Operation failed!",
            };
            res.status(200).send(message);
        }
    } catch (err) {
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});


UserRoute.patch("/delete/:UserId", async (req, res) => {
	try {
		const result = await User.findOneAndUpdate({ _id: req.params.UserId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "user deleted successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});




UserRoute.post("/search", async (req, res) => {
	try {
		const searchText = req.body.searchText;
		let result = []
        if(req.body?.searchText && searchText != '') {
            console.log('hello1');
            result = await User.find({
                "$or":[{organization:searchText },{role:searchText}]}, {is_deleted: false}).populate([
                    {
                        path: "organization",
                        select: "uniqueId name email phone"
                    },
                    {
                        path: "role",
                        select: "name"
                    }
                ]).sort({_id: -1})
        } else {
            console.log('hello2');
            result = await User.find({is_deleted: false}).populate([
                    {
                        path: "organization",
                        select: "uniqueId name email phone"
                    },
                    {
                        path: "role",
                        select: "name"
                    }
                ]).sort({_id: -1})
        }
            
        result = result.filter(e => e.role != null && e.organization != null && !e.deleted_at)
        message = {
            error: false,
            message: "User search successfully!",
            data:result
        };
        res.status(200).send(message);
		// if (result) {
		// } else {
		// 	message = {
		// 		error: true,
		// 		message: "User search failed",
		// 	};
		// 	res.status(200).send(message);
		// }
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});


module.exports = UserRoute;