require("dotenv").config();
const express = require("express");

const SurvivorProfile = require("../models/survivor_profile");
const State = require("../models/state");
const Partner = require("../models/partners");
const Shg = require("../models/shg");
const Collective = require("../models/collective");
const Organization = require("../models/organization");
const isAuthenticate = require("../middleware/authcheck");

const AdminDashboardRoute = express.Router();

AdminDashboardRoute.get("/data", isAuthenticate, async (req, res) => {
    try {

        //-------------------- section 1 : top countings -------------------//
        const totalPartner = await Partner.count({is_deleted: false});
        const totalShg = await Shg.count({is_deleted: false});
        const totalCollective = await Collective.count({is_deleted: false});
        const totalOrganization = await Organization.count({is_deleted: false});
        //----------------------- section 1 : end --------------------------//

        //------------- section 2 : survivor count state wise --------------//
        let states = await State.find({});
        let stateIds = [];
        states.forEach(element => {
            stateIds.push(String(element._id));
        });

        let stateWiseSurvivor = await SurvivorProfile.aggregate([
            { "$match" : { is_deleted : false } },
            { "$group" : {_id:{state: "$state"}, count:{$sum:1}}},
            { "$lookup": {
                "from": "states",
                "localField": "_id.state",
                "foreignField": "_id",
                "as": "stateDetail"
            }},
        ])
        //------------------------ section 2 : end --------------------------//

        //------------- section 3 : survivor count by age group -------------//
        let ageWiseSurvivorCount = await SurvivorProfile.aggregate([
            { "$match" : { is_deleted : false } },
            {"$group" : {_id:{age_when_trafficked: "$age_when_trafficked"}, count:{$sum:1}}},
        ])

        let ageWiseSurvivor = [];
        let i=0,j=0,k=0,l=0;
        ageWiseSurvivorCount.forEach((element, index) => {
            // console.log(element?._id?.age_when_trafficked, " > ", element?.count);

            if (element?._id?.age_when_trafficked < 18) {
                ageWiseSurvivor[0] = {
                    age: "Below 18 yrs",
                    count: i=i+element.count
                }
            } 
            if (element?._id?.age_when_trafficked >= 18 && element?._id?.age_when_trafficked <= 22) {
                ageWiseSurvivor[1] = {
                    age: "18-22 yrs",
                    count: j=j+element.count
                }
            } 
            if (element?._id?.age_when_trafficked >= 23 && element?._id?.age_when_trafficked <= 29) {
                ageWiseSurvivor[2] = {
                    age: "23-29 yrs",
                    count: k=k+element.count
                }
            } 
            if (element?._id?.age_when_trafficked > 29) {
                ageWiseSurvivor[3] = {
                    age: "Above 30 yrs",
                    count: l=l+element.count
                }
            }
        })
        //------------------------ section 3 : end --------------------------//

        //----------------- section 4 : survivor count by month -------------//
        let currentYear = new Date().getFullYear();
        
        // for (let index = 0; index < 12; index++) {
        //     let crrDate = new Date();
        //     crrDate.setDate(1);
        //     crrDate.setMonth(index);
        //     crrDate.setFullYear(currentYear);
        //     crrDate.setUTCHours(0);
        //     crrDate.setUTCMinutes(0);
        //     crrDate.setUTCSeconds(0);
        //     crrDate.setUTCMilliseconds(0);
        //     console.log(crrDate);


        // }

        let monthWiseSurvivorCount = await SurvivorProfile.aggregate([
            { "$match" : { is_deleted : false } },
            {$group: {
                _id: {$month: "$createdAt"}, 
                count: {$sum: 1} 
            }}
        ]);

        let months = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sept",
            "oct",
            "nov",
            "dec"
        ]
        let monthWiseSurvivor = [];
        months.forEach((element, index) => {
            let monthData = monthWiseSurvivorCount.find(e => e._id == index+1);
            // console.log(monthData);
            monthWiseSurvivor[index] = {
                month: element,
                count: (monthData !== undefined) ? monthData?.count : 0
            }

        })
        //------------------------ section 4 : end --------------------------//

        message = {
            error: false,
            message: "Admin Dashboard Data",
            data: {
                totalPartner,
                totalShg,
                totalCollective,
                totalOrganization,
                stateWiseSurvivor,
                ageWiseSurvivor,
                monthWiseSurvivor
            }
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});


module.exports = AdminDashboardRoute;