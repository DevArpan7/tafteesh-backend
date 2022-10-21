require("dotenv").config();
const express = require("express");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorVc = require("../models/survivor_vc");
const SurvivorPc = require("../models/survivor_pc");
const State = require("../models/state");
const isAuthenticate = require("../middleware/authcheck");
const { default: mongoose } = require("mongoose");
const PcCurrentStatus = require("../models/pcmodel/pc_current_status");
const VcStatus = require("../models/status_master/vc_status");
const SurvivorDashboardRoute = express.Router();




SurvivorDashboardRoute.get("/list", isAuthenticate, async (req, res) => {
    try {

        let SurvivorvcdashboardData = await SurvivorVc.find({is_deleted:false}).populate([
            {
				path: "survivor",
				select: "survivor_name survivor_id"
			}
        ]).sort({_id:-1}).limit(5);

        //let checkvc = SurvivorvcdashboardData.filter(e=>e.is_deleted == false)
        let countvc = SurvivorvcdashboardData.length;

        let sourcevcsa = SurvivorvcdashboardData.filter(e => e.source == 'sa')

        let countsa = sourcevcsa.length;

        let sourcevcda = SurvivorvcdashboardData.filter(e => e.source == 'da')

        let countda = sourcevcda.length;


       
        let SurvivorpcdashboardData = await SurvivorPc.find({is_deleted:false}).populate([
            {
				path: "survivor",
				select: "survivor_name survivor_id"
			}
        
        ]).sort({_id:-1}).limit(5);

        //let checkpc = SurvivorpcdashboardData.filter(e => e.is_deleted == false)
		let countpc = SurvivorpcdashboardData.length;

        let sourcepcsa = SurvivorpcdashboardData.filter(e => e.source == 'sa')

        let countpcsa = sourcepcsa.length;

        let sourcepcda = SurvivorpcdashboardData.filter(e => e.source == 'da')

        let countpcda = sourcepcda.length;
		

        message = {
            error: false,
            message: "All SurvivorFir list",
            datavc:SurvivorvcdashboardData ,
            datapc:SurvivorpcdashboardData,
			totalcountvc:countvc,
            totalcountpc:countpc,
            totalcountvcsa:countsa,
            totalcountvcda:countda,
            totalcountpcsa:countpcsa,
            totalcountpcda:countpcda  
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});


SurvivorDashboardRoute.get("/list-by-id/:SocialworkerId", isAuthenticate, async (req, res) => {
    try {

        let survivorData = await SurvivorProfile.find({$and:[{user_id:req.params.SocialworkerId},{ is_deleted: false }]});
        let survivorIds = survivorData.map(e => e._id.toString());
        //console.log(survivorIds)

        //----------------------------------- VC data -------------------------------------//
        let SurvivorvcdashboardData = await SurvivorVc.find({
            $and:[
                {is_deleted: false},
                {survivor: {$in: survivorIds}}
            ]
        }).populate([
            {
				path: "survivor",
				select: "survivor_name survivor_id user_id"
			},
            {
                path: "vc_status",
                select: "name"
            }
        ]).sort({_id:-1});

        
        SurvivorvcdashboardData = JSON.parse(JSON.stringify(SurvivorvcdashboardData))
        SurvivorvcdashboardData.map( e => {
            e.survivor_id = String(e.survivor._id)
            e.vc_status_id = String(e.vc_status?._id)
        })
        const key = 'survivor_id';

        const uniqueSurvivorVc = [...new Map(SurvivorvcdashboardData.map(item => [item[key], item])).values()];
        //---------------------------------------------------------------------------------//


        //------------------------------------ PC data ------------------------------------//
        let SurvivorpcdashboardData = await SurvivorPc.find({
            $and:[
                {is_deleted: false},
                {survivor: {$in: survivorIds}}
            ]
        }).populate([
            {
				path: "survivor",
				select: "survivor_name survivor_id user_id"
			},
            {
                path: "current_status",
                select: "name"
            }
        ]).sort({_id:-1});

        SurvivorpcdashboardData = JSON.parse(JSON.stringify(SurvivorpcdashboardData))
        SurvivorpcdashboardData.map( e => {
            e.survivor_id = String(e.survivor._id)
            e.current_status_id = String(e.current_status._id)
        })
        const Pckey = 'survivor_id';

        const uniqueSurvivorPc = [...new Map(SurvivorpcdashboardData.map(item => [item[Pckey], item])).values()];
        //------------------------------------------------------------------------------------//


        //-------------------------------- Count PC by SA/DA ---------------------------------//

        let pcCurrentStatuses = await PcCurrentStatus.find({is_deleted: false})
        let pcSaCounts = {};
        let pcDaCounts = {};
        pcCurrentStatuses.map((e, index) => {
            let key = e.name;
            pcSaCounts[key] = SurvivorpcdashboardData.filter(ele => (String(ele.current_status_id) == String(e._id)) && String(ele.source).toLowerCase() == 'sa').length

            pcDaCounts[key] = SurvivorpcdashboardData.filter(ele => (String(ele.current_status_id) == String(e._id)) && String(ele.source).toLowerCase() == 'da').length
        })

        // return res.status(200).send({pcSaCounts, pcDaCounts})

        //---------------------------------------------------------------------------------//
        
        
        //-------------------------------- Count VC by SA ---------------------------------//
        let countvc = SurvivorvcdashboardData.length;
        let vcStatuses = await VcStatus.find({is_deleted: false});
        let vcSaCounts = {};
        let vcDaCounts = {};
        vcStatuses.map((e, index) => {
            let key = e.name;
            vcSaCounts[key] = SurvivorvcdashboardData.filter(ele => (String(ele.status) == String(e.name)) && String(ele.source).toLowerCase() == 'sa').length

            vcDaCounts[key] = SurvivorvcdashboardData.filter(ele => (String(ele.status) == String(e.name)) && String(ele.source).toLowerCase() == 'da').length
        })

        // return res.status(200).send({vcSaCounts, vcDaCounts})

        let sourcevcsa = SurvivorvcdashboardData.filter(e => e.source == 'sa')
        let countsa = sourcevcsa.length;
        //---------------------------------------------------------------------------------//

        
        //---------------------------- Count VC by DA ---------------------------------//
        let sourcevcda = SurvivorvcdashboardData.filter(e => e.source == 'da');
        let countda = sourcevcda.length;
        //---------------------------------------------------------------------------------//

        
        let countpc = SurvivorpcdashboardData.length;

        let sourcepcsa = SurvivorpcdashboardData.filter(e => e.source == 'sa')
        let countpcsa = sourcepcsa.length;
        let sourcepcda = SurvivorpcdashboardData.filter(e => e.source == 'da')
        let countpcda = sourcepcda.length;
    

        let states = await State.find({is_deleted:false});
        let stateIds = [];
        states.forEach(element => {
            stateIds.push(String(element._id));
        });


        //----------------------------- State Wise Count ------------------------------//
        let stateWiseSurvivor = await SurvivorProfile.aggregate([
            { "$match" : {
                user_id: mongoose.Types.ObjectId(req.params.SocialworkerId), 
                is_deleted:false
            }},
            { "$group" : {
                _id: { state: "$state" }, 
                count:{ $sum: 1 }
            }},
            { "$lookup": {
                "from": "states",
                "localField": "_id.state",
                "foreignField": "_id",
                "as": "stateDetail"
            }},
        ])
        //---------------------------------------------------------------------------//


        //----------------------------- Age Wise Count ------------------------------//
        let ageWiseSurvivorCount = await SurvivorProfile.aggregate([
            { "$match" : {
                user_id: mongoose.Types.ObjectId(req.params.SocialworkerId), 
                is_deleted:false
            }},
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
        //--------------------------------------------------------------------------//

        message = {
            error: false,
            message: "All SurvivorFir list",
            dataVc: uniqueSurvivorVc ,
            dataPc: uniqueSurvivorPc,
			totalCountVc: countvc,
            totalCountPc: countpc,

            totalCountVcSa: countsa,
            totalAwardedCountVcSa: vcSaCounts?.Awarded,

            totalCountVcDa: countda,
            totalAwardedCountVcDa: vcDaCounts?.Awarded,

            totalCountPcSa: countpcsa,
            totalConcludedCountPcSa: pcSaCounts?.Concluded,

            totalCountPcDa: countpcda,
            totalConcludedCountPcDa: pcDaCounts?.Concluded,

            vcSaCounts,
            vcDaCounts,
            pcSaCounts,
            pcDaCounts,
            stateWiseSurvivor,
            ageWiseSurvivor: ageWiseSurvivor

        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err.toString(),
        };
        res.status(200).send(message);
    }
});





module.exports = SurvivorDashboardRoute;

