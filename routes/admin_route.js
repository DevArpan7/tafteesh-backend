require("dotenv").config();
const express = require("express");

const Admin = require("../models/admin");
const AdminRoute = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticate = require("../middleware/authcheck");
const generateAccessToken = require("../helper/generateAccessToken");
const checkNumber = require("../helper/checkNumber");

const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();

/**
 * This method is to get list of Admin details
 */
AdminRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        const AdminData = await Admin.find({}).sort({_id:-1});
        message = {
            error: false,
            message: "All Admins list",
            data: AdminData,
        };
        res.status(200).send(message);
    } catch (err) {
        message = {
            error: true, 
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create new Admin
 */
// AdminRoute.post("/create", async (req, res) => {
//     try {
//         const AdminExist = await Admin.findOne({
//             $or: [{email: req.body.email}, {mobile: req.body.mobile}, {Adminname: req.body.username}]
//         });
//         if (AdminExist) {
//             message = {
//                 error: true,
//                 message: "Admin already exist!"
//             };
//         } else {
//             const AdminData = new Admin(req.body);
//             const result = await AdminData.save();
//             message = {
//                 error: false,
//                 message: "Admin Added Successfully!",
//                 data: result
//             };
//         }
//         return res.status(200).send(message);
        
        
//     } catch (err) {
//         message = {
//             error: true,
//             message: "Operation Failed!",
//             data: err,
//         };
//         return res.status(200).send(message);
//     }
// });

/**
 * This method is to get details of Admin
 * @param str AdminId
 */
AdminRoute.get("/detail/:AdminId", isAuthenticate, async (req, res) => {
    try {
        const AdminData = await Admin.findOne({_id: req.params.AdminId}).populate([
            {
                path: "role",
                select: "name"
            },
        ]);

        if (AdminData) {
            infoLogger.info({
                req: req.params, 
                res: AdminData, 
                method:"GET", 
                url: req.originalUrl, 
                error: false
            });

            messageData = {
                error: false, 
                message: 'Admin data found', 
                data: AdminData
            }
        } else {
            errorLogger.error({
                req: req.params, 
                res: {}, 
                method:"GET", 
                url: req.originalUrl, 
                error: true
            });

            messageData = {
                error: true, 
                message: 'No data found'
            }
        }
        return res.status(200).send(messageData)
    } catch (error) {
        errorLogger.error({
            req: req.params, 
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
 * This method is to set update Admin details
 * @param str AdminId
 */
AdminRoute.patch("/update-profile/:AdminId", isAuthenticate, async (req, res) => {
    try {
        delete req.body.email;
        delete req.body.mobile;
        delete req.body.password;
        const result = await Admin.findOneAndUpdate({
            _id: req.params.AdminId
        }, req.body, {
            new: true
        });
        result.password = ''
        if (result) {
            infoLogger.info({
                req: req.body, 
                res: result, 
                method:"PATCH", 
                url: req.originalUrl, 
                error: false
            });

            message = {
                error: false,
                message: "Profile Updated Successfully!",
                data: result
            };
            return res.status(200).send(message);
        } else {
            errorLogger.error({
                req: req.body, 
                res: {}, 
                method:"PATCH", 
                url: req.originalUrl, 
                error: true
            });

            message = {
                error: true,
                message: "Not found!"
            };
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
 * This method is to change password of Admin
 * @param str AdminId
 */
AdminRoute.patch("/change-password/:AdminId", isAuthenticate, async (req, res) => {
    try {
        if (req.body.old_password && req.body.new_password) {
            if (req.body.old_password === req.body.new_password) {
                message = {
                    error: true,
                    message: "Old and new password can not be same"
                }
                return res.status(200).send(message);
            }
            const AdminData = await Admin.findOne({
                _id: req.params.AdminId
            });
            if (AdminData === null) {
                message = {
                    error: true,
                    message: "Admin not found!"
                }
            } else {
                passwordCheck = await bcrypt.compare(req.body.old_password, AdminData.password);
                if (passwordCheck) {
                    const result = await Admin.updateOne({
                        _id: req.params.AdminId
                    }, {
                        password: req.body.new_password
                    });
                    message = {
                        error: false,
                        message: "Admin password updated!"
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
            data: String(err),
        };
        res.status(500).send(message);
    }
});

/**
 * This method is to forget password of a Admin
 * @param str email || @param number mobile || @param str Adminname
 * 
 */

 /**
 * This method is to forget password
 * @param str email || @param number mobile || @param str username
 */
  AdminRoute.post("/forget-password", async (req, res) => {
	try {
        //let otpData=1234
        if(req.body.user){
            const AdminData = await Admin.findOne({ email: req.body.user });
            if(AdminData == null){
               message = {
                error:true,
                message:"Admin not found"
               }
               return res.status(200).send(message);
            }else{
                const otpData = {
                    emailOtp: 1234,
                }
                message = {
                    error:false,
                    message:"Otp received!",
                    data:otpData
                   }
            }
            return res.status(200).send(message);
            //return res.redirect('/change-password')
        }
      
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to verify password
 * @param str email || @param number mobile || @param str username
 */
 AdminRoute.post("/verify-otp", async (req, res) => {
	try {
        if(req.body.user && req.body.otp){
            const AdminData = await Admin.findOne({$and:[{email:req.body.user},{emailOtp:req.body.otp}]});
            console.log("AdminData",AdminData);
            
            if(AdminData == null){
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * reset password
 */

AdminRoute.patch("/reset-password",  async (req, res) => {
    try {
        if (req.body.new_password && req.body.confirm_password) {
            if (req.body.new_password !== req.body.confirm_password) {
                message = {
                    error: true,
                    message: "new and confirm password are not equal"
                }
                return res.status(200).send(message);
            }
            const AdminData = await Admin.findOne({
                email: req.body.email
            });
           
            if (AdminData === null) {
                message = {
                    error: true,
                    message: "Admin not found!"
                }
            } else {
                    const result = await Admin.findOneAndUpdate({
                        email: req.body.email
                    }, {
                        password: req.body.new_password
                    });

                   console.log("result",result);
                    
                    message = {
                        error: false,
                        message: "Admin password reset successfully!"
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
            data: String(err),
        };
        res.status(500).send(message);
    }
});





// AdminRoute.patch("/forget-password", async (req, res) => {
// 	try {
// 		if (req.body.user) {
//             const randomPassword = Math.random().toString(36).slice(2);
//             const AdminData = await Admin.findOneAndUpdate({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) }, { Adminname: req.body.user } ]}, { password: randomPassword }, {new:true});
//             if (AdminData === null) {
//                 message = {
//                     error: true,
//                     message: "Admin not found!"
//                 }
//                 return res.status(200).send(message);
//             } else {
//                 message = {
//                     error: false,
//                     message: "Admin password updated!",
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
 * This method is to login a Admin
 * @param str email
 * @param str password
 */
AdminRoute.post("/login", async (req, res) => {
    try {
        if (isNaN(req.body.user)) {
        }
        if (req.body.user && req.body.password || req.body.remember_me) {
            AdminData = await Admin.findOne({$or: [ { email: req.body.user }, { mobile: checkNumber(req.body.user) } ]}).populate({
                path: "role",
                select: "name"
            });
            if (AdminData === null) {
                errorLogger.error({
                    req: req.body, 
                    res: {}, 
                    method:"POST", 
                    url: req.originalUrl, 
                    error: true
                });
                
                message = {
                    error: true,
                    message: "Invalid email, please enter valid email Id"
                }
                return res.status(200).send(message);
            } else {
                passwordCheck = await bcrypt.compare(req.body.password, AdminData.password);
                if (passwordCheck) {
                    if (AdminData.status === true) {
                        //generate access and refresh token
                        AdminData.password = "";
                        const Admin = {
                            data: AdminData
                        };
                        const accessToken = await generateAccessToken(Admin);
                        const refreshToken = await jwt.sign(Admin, process.env.REFRESH_TOKEN_KEY);

                        infoLogger.info({
                            req: req.body, 
                            res: AdminData, 
                            method:"POST", 
                            url: req.originalUrl, 
                            error: false
                        });

                        message = {
                            error: false,
                            message: "Admin logged in!",
                            data: [AdminData, {
                                accessToken: accessToken,
                                refreshToken: refreshToken
                            }]
                        }
                        return res.status(200).send(message);
                    } else {
                        errorLogger.error({
                            req: req.body, 
                            res: {}, 
                            method:"POST", 
                            url: req.originalUrl, 
                            error: true
                        });

                        message = {
                            error: true,
                            message: "Admin is in active!"
                        }
                        return res.status(403).send(message);
                    }
                } else {

                    errorLogger.error({
                        req: req.body, 
                        res: {}, 
                        method:"POST", 
                        url: req.originalUrl, 
                        error: true
                    });

                    message = {
                        error: true,
                        message: "wrong password!"
                    }
                    return res.status(200).send(message);
                }
            }
        } else {
            errorLogger.error({
                req: req.body, 
                res: {}, 
                method:"POST", 
                url: req.originalUrl, 
                error: true
            });

            res.status(403).send({
                message: "Email and Password are required.",
            });
        }
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
            message: "Operation Failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});

AdminRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await Admin.find({"$or":[{" username":{"$regex":searchText,$options: 'i' }},{"mobile":{"$regex":searchText,$options: 'i'}},{"email":{"$regex":searchText,$options: 'i'}}]})
	
		if (result) {
			message = {
				error: false,
				message: "Admin search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Admin search failed",
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

/**
 * delete
 */

AdminRoute.delete("/delete/:AdminID", isAuthenticate, async (req, res) => {
	try {
		const result = await Admin.deleteOne({ _id: req.params.AdminID });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Admin deleted successfully!",
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


module.exports = AdminRoute;