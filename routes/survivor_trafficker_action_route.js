require("dotenv").config();
const express = require("express");
const SrvTraffickerProfile = require("../models/survivor_trafficker");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargeSheet = require("../models/survivor_chargesheet");
const TraffickerProfile = require("../models/trafficker_profile_v2");
const TraffickerActionRoute = express.Router();

TraffickerActionRoute.get("/list/:TraffickerId",async(req,res)=>{
    try{
    const SurvivorList = await SrvTraffickerProfile.find({$and:{trafficker:{$elemMatch:{trafficker_details:req.params.TraffickerId}}}}).populate([
    
        {
            path:"survivor",
            select:"survivor_name"
        }
    ])

    message = {
        error: false,
        message: "All Trafficker Profile list",
        data: SurvivorList,
    };
}catch(err){
    message = {
        error: true,
        message: "operation failed!",
        data: err,
    };
    res.status(200).send(message);
}
})



module.exports=TraffickerActionRoute;