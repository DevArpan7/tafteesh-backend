require("dotenv").config();
const express = require("express");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorDiary = require("../models/survivor_diary");
const SurvivorVc = require("../models/survivor_vc");
const SurvivorPc = require("../models/survivor_pc");
const CIT = require("../models/cit");
const { Console } = require("winston/lib/winston/transports");
const isAuthenticate = require("../middleware/authcheck");
const CitGoal = require("../models/cit_goal");
const MonthlyReportRoute = express.Router();

//survivors count by month


MonthlyReportRoute.get("/all-list/:SocialWorkerId",  async(req,res)=>{
    try{
        let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
        let startDate = 01;
        let endDate;
        let month;

        if (req.query.month == 'jan') {
            month = 01;
            endDate = 31;

        }
        if (req.query.month == 'feb') {
            month = 02
            endDate = (req.query.year%4) == 0 ? 29 : 28
        }
        if (req.query.month == 'mar') {
            month = 03
            endDate = 31
        }
        if (req.query.month == 'apr') {
            month = 04
            endDate = 30
            nextMonth = 05
            nextEndDate = 31
        }
        if (req.query.month == 'may') {
            month = 05
            endDate = 31
        }
        if (req.query.month == 'jun') {
            month = 06
            endDate = 30
        }
        if (req.query.month == 'jul') {
            month = 07
            endDate = 31
        }
        if (req.query.month == 'aug') {
            month = 08
            endDate = 31
        }
        if (req.query.month == 'sep') {
            month = 09
            endDate = 30
        }
        if (req.query.month == 'oct') {
            month = 10
            endDate = 31
        }
        if (req.query.month == 'nov') {
            month = 11
            endDate = 30
        }
        if (req.query.month == 'dec') {
            month = 12
            endDate = 31
        }
        const start_date = new Date(`${month}-${startDate}-${req.query.year}`);
        const end_date = new Date(`${month}-${endDate}-${req.query.year}`);

        // return res.status(200).send({start_date, end_date, year: req.query.year, month: req.query.year});

        let survivorData = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gt: start_date, $lte: end_date }}, { is_deleted: false }]})

        survivorData.map(e => {
            if (e.status_in_tafteesh != null) {
                e.status_in_tafteesh = e?.status_in_tafteesh.toLowerCase()
            }
            if (e.source != null) {
                e.source = e?.source.toLowerCase()
            }
        })

        let survivorIds = survivorData.map(e => e._id.toString())
        
        //console.log(survivorIds)

        let survivorActive = survivorData.filter(e => e.status_in_tafteesh == 'active');
        let survivorDropOut = survivorData.filter(e => e.status_in_tafteesh == 'dropped out');

        let survivorVcData = await SurvivorVc.find({$and:[{survivor: {$in: survivorIds}},{ is_deleted: false }]});
        //console.log(survivorVcData);

        let vcSa = survivorVcData.filter(e => e.source == 'sa')
        let vcDa = survivorVcData.filter(e => e.source == 'da')


        let survivorPcData = await SurvivorPc.find({$and:[{survivor: {$in: survivorIds}},{ is_deleted: false }]});

       
        let pcSa = survivorPcData.filter(e => e.source == 'sa')
        let pcDa = survivorPcData.filter(e => e.source == 'da')
        
    
        message = {
            error:false,
            message: "Monthly report",
            survivor:{
                totalSurvivor:survivorData.length,
                totalActive:survivorActive.length,
                totalDropOUt:survivorDropOut.length,
            },
            VC:{
                totalVc:survivorVcData.length,
                totalVcSa:vcSa.length,
                totalVcDa:vcDa.length
            },
            PC:{
                totalPc:survivorPcData.length,
                totalPcSa:pcSa.length,
                totalPcDa:pcDa.length
            }
            

        }
        res.status(200).send(message);

    }catch(err){
        message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
    }
    
})

MonthlyReportRoute.get("/survivor-and-engagement-count/:SocialWorkerId",  async(req,res)=>{
    try{
        let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
        let startDate = 01;
        let endDate;
        let nextEndDate;
        let month;
        let nextMonth;
        let nextYear = req.query.year;

        if (req.query.month == 'jan') {
            month = 01;
            endDate = 31;
            nextMonth = 02;
            nextEndDate = (req.query.year%4) == 0 ? 29 : 28

        }
        if (req.query.month == 'feb') {
            month = 02
            endDate = (req.query.year%4) == 0 ? 29 : 28
            nextMonth = 03
            nextEndDate = 31
        }
        if (req.query.month == 'mar') {
            month = 03
            endDate = 31
            nextMonth = 04
            nextEndDate = 30
        }
        if (req.query.month == 'apr') {
            month = 04
            endDate = 30
            nextMonth = 05
            nextEndDate = 31
        }
        if (req.query.month == 'may') {
            month = 05
            endDate = 31
            nextMonth = 06
            nextEndDate = 30
        }
        if (req.query.month == 'jun') {
            month = 06
            endDate = 30
            nextMonth = 07
            nextEndDate = 31
        }
        if (req.query.month == 'jul') {
            month = 07
            endDate = 31
            nextMonth = 08
            nextEndDate = 31
        }
        if (req.query.month == 'aug') {
            month = 08
            endDate = 31
            nextMonth = 09
            nextEndDate = 30
        }
        if (req.query.month == 'sep') {
            month = 09
            endDate = 30
            nextMonth = 10
            nextEndDate = 31
        }
        if (req.query.month == 'oct') {
            month = 10
            endDate = 31
            nextMonth = 11
            nextEndDate = 30
        }
        if (req.query.month == 'nov') {
            month = 11
            endDate = 30
            nextMonth = 12
            nextEndDate = 31
        }
        if (req.query.month == 'dec') {
            month = 12
            endDate = 31
            nextMonth = 01
            nextEndDate = 31
            nextYear = req.query.year+1 
        }
        const start_date = new Date(`${month}-${startDate}-${req.query.year}`);
        const end_date = new Date(`${month}-${endDate}-${req.query.year}`);

        const next_start_date = new Date(`${nextMonth}-${startDate}-${nextYear}`);
        const next_end_date = new Date(`${nextMonth}-${nextEndDate}-${nextYear}`);

        // return res.status(200).send({start_date, end_date, next_start_date, next_end_date, endDate, nextEndDate}) 

        /**
         * ****************** Survivor section ********************
         */
        let monthWiseSurvivor = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]})

        monthWiseSurvivor.map(e => {
            if (e.status_in_tafteesh != null) {
                e.status_in_tafteesh = e?.status_in_tafteesh.toLowerCase()
            }
        })

        let totalSurvivor = monthWiseSurvivor.length
        let monthWiseApprovedSurvivor = monthWiseSurvivor.filter(e => e.approval == true);
        let monthWiseNotApprovedSurvivor = monthWiseSurvivor.filter(e => e.approval == false);
        //let activeSurvivor = monthWiseSurvivor.filter(e=>e.status_in_tafteesh=='active');
        let dropoutSurvivor = monthWiseSurvivor.filter(e => e.status_in_tafteesh == 'dropped out');

        /**
         * ****************** Engagement section ********************
         */
        let monthWiseEngagement = await SurvivorDiary.find({$and:[{user:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]});

        monthWiseEngagement.map(e => {
            if (e.status != null) {
                e.status = e?.status.toLowerCase()
            }
        })

        let monthWiseEngagementConducted = monthWiseEngagement.filter(e => e.status == 'completed');
        let nextMonthWiseEngagement = await SurvivorDiary.find({$and:[{user:req.params.SocialWorkerId},{createdAt:{ $gte: next_start_date, $lte: next_end_date }}, { is_deleted: false }]});


        message = {
            error:false,
            message: "Monthly report",
            survivordata : {
                // monthWiseSurvivor,
                totalSurvivor,
                totalApprovedSurvivor: monthWiseApprovedSurvivor.length,
                totalNotApprovedSurvivor: monthWiseNotApprovedSurvivor.length,
                totalDropOutSurvivor: dropoutSurvivor.length,
            },
            diarydata : {
                totalDairy: monthWiseEngagement.length,
                totalConducted: monthWiseEngagementConducted.length,
                nextMonth: nextMonthWiseEngagement.length
            }

        }
        res.status(200).send(message);


    }catch(err){
        message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
    }


})

MonthlyReportRoute.get("/engagement-list/:socialWorkerId",  async(req,res)=>{
    try{
        let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
        let startDate = 01;
        let endDate;
        let nextEndDate;
        let month;
        let nextMonth;
        let nextYear = req.query.year;

        if (req.query.month == 'jan') {
            month = 01;
            endDate = 31;
            nextMonth = 02;
            nextEndDate = (req.query.year%4) == 0 ? 29 : 28

        }
        if (req.query.month == 'feb') {
            month = 02
            endDate = (req.query.year%4) == 0 ? 29 : 28
            nextMonth = 03
            nextEndDate = 31
        }
        if (req.query.month == 'mar') {
            month = 03
            endDate = 31
            nextMonth = 04
            nextEndDate = 30
        }
        if (req.query.month == 'apr') {
            month = 04
            endDate = 30
            nextMonth = 05
            nextEndDate = 31
        }
        if (req.query.month == 'may') {
            month = 05
            endDate = 31
            nextMonth = 06
            nextEndDate = 30
        }
        if (req.query.month == 'jun') {
            month = 06
            endDate = 30
            nextMonth = 07
            nextEndDate = 31
        }
        if (req.query.month == 'jul') {
            month = 07
            endDate = 31
            nextMonth = 08
            nextEndDate = 31
        }
        if (req.query.month == 'aug') {
            month = 08
            endDate = 31
            nextMonth = 09
            nextEndDate = 30
        }
        if (req.query.month == 'sep') {
            month = 09
            endDate = 30
            nextMonth = 10
            nextEndDate = 31
        }
        if (req.query.month == 'oct') {
            month = 10
            endDate = 31
            nextMonth = 11
            nextEndDate = 30
        }
        if (req.query.month == 'nov') {
            month = 11
            endDate = 30
            nextMonth = 12
            nextEndDate = 31
        }
        if (req.query.month == 'dec') {
            month = 12
            endDate = 31
            nextMonth = 01
            nextEndDate = 31
            nextYear = req.query.year+1 
        }
        const start_date = new Date(`${month}-${startDate}-${req.query.year}`);
        const end_date = new Date(`${month}-${endDate}-${req.query.year}`);

        const next_start_date = new Date(`${nextMonth}-${startDate}-${nextYear}`);
        const next_end_date = new Date(`${nextMonth}-${nextEndDate}-${nextYear}`);

        // return res.status(200).send({start_date, end_date, next_start_date, next_end_date, endDate, nextEndDate})      

        /**
         * ****************** engagement detail section ********************
         */
        let monthlySurvivorsDiary = await SurvivorDiary.find(
            {$and:
                [
                    { user: req.params.socialWorkerId},
                    { is_deleted: false }
                ]
            }
        ).distinct("survivor");

        let survivors = await SurvivorProfile.find({
            _id: {$in: monthlySurvivorsDiary}
        }).select("survivor_name")

        let engagementListDetail = [];

        for (let index = 0; index < survivors.length; index++) {
            let currentMonthData = await SurvivorDiary.find(
                {$and:
                    [
                        { survivor: survivors[index]?._id },
                        { user: req.params.socialWorkerId },
                        {
                            createdAt: { $gt: start_date, $lte: end_date }
                        },
                        { is_deleted: false }
                    ]
                }
            )

            currentMonthData.map(e => {
                if (e.status != null) {
                    e.status = e?.status.toLowerCase()
                }
            })

            let nextMonthData = await SurvivorDiary.find(
                {$and:
                    [
                        { survivor: survivors[index]?._id },
                        { user: req.params.socialWorkerId },
                        {
                            createdAt: { $gt: next_start_date, $lte: next_end_date }
                        },
                        { is_deleted: false }
                    ]
                }
            )

            engagementListDetail.push({
                survivor: {
                    name: survivors[index]?.survivor_name,
                    id: survivors[index]?._id
                },
                planned: currentMonthData.length,
                conducted: currentMonthData.filter(e => e.status == 'completed').length,
                next: nextMonthData.length
            })
        }

        res.status(200).send(engagementListDetail);


    }catch(err){
        message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
    }


})

MonthlyReportRoute.get("/action-list-count/:SocialWorkerId",  async(req,res)=>{
    try {
        let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
        let startDate = 01;
        let endDate;
        let month;

        if (req.query.month == 'jan') {
            month = 01;
            endDate = 31;

        }
        if (req.query.month == 'feb') {
            month = 02
            endDate = (req.query.year%4) == 0 ? 29 : 28
        }
        if (req.query.month == 'mar') {
            month = 03
            endDate = 31
        }
        if (req.query.month == 'apr') {
            month = 04
            endDate = 30
            nextMonth = 05
            nextEndDate = 31
        }
        if (req.query.month == 'may') {
            month = 05
            endDate = 31
        }
        if (req.query.month == 'jun') {
            month = 06
            endDate = 30
        }
        if (req.query.month == 'jul') {
            month = 07
            endDate = 31
        }
        if (req.query.month == 'aug') {
            month = 08
            endDate = 31
        }
        if (req.query.month == 'sep') {
            month = 09
            endDate = 30
        }
        if (req.query.month == 'oct') {
            month = 10
            endDate = 31
        }
        if (req.query.month == 'nov') {
            month = 11
            endDate = 30
        }
        if (req.query.month == 'dec') {
            month = 12
            endDate = 31
        }
        const start_date = new Date(`${month}-${startDate}-${req.query.year}`);
        const end_date = new Date(`${month}-${endDate}-${req.query.year}`);

        // return res.status(200).send({start_date, end_date});

        let survivorData = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gt: start_date, $lte: end_date }}, { is_deleted: false }]})

        let survivorIds = survivorData.map(e => e._id.toString())

        /**
         * ****************** action list count ********************
         */


        /**
         * ****************** vc records count ********************
         */

         let survivorDataList = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{ is_deleted: false }]});

        //console.log(survivorDataList);

         let survivorListIds = survivorDataList.map(e => e._id.toString())

        // console.log(survivorListIds);

         let vcDataList = await SurvivorVc.find({
            $and: [
                {is_deleted: false},
                {survivor: {$in: survivorListIds}}
            ]
        })
        //console.log(vcDataList);

        //let vcDataCount = vcDataList.length;
        //console.log(vcDataCount);

        let vcData = await SurvivorVc.find({
            $and: [
                {is_deleted: false},
                {createdAt: {$gte: start_date, $lte: end_date}},
                {survivor: {$in: survivorIds}}
            ]
        })

        let vcDataCount = vcData.length;

        vcData.map(e => e.source = e.source.toLowerCase())
        vcData.map(e => {
            if (e.status != null) {
                e.status = e?.status.toLowerCase()
            } else {
                e.status = 'applied'
            }
        })
        // vcData = vcData.map(e => {return e.status})
        // vcData.map(e => e.result = e.result.toLowerCase())

        // return res.status(200).send(vcData);
        // console.log(vcData);
        let vcCount = vcData.length
           //console.log(vcCount);
        let vcSaCount = vcData.filter(e => e.source == 'sa');
        let vcdaCount = vcData.filter(e => e.source == 'da');

        let vcOpen = vcData.filter(e=>e.result?.toLowerCase() == 'awaiting').length;
        let vcClose = vcData.filter(e=>e.result?.toLowerCase() == 'awarded').length;

        // return res.status(200).send({vcData, vcOpen, vcClose})

        let awardedCount = vcData.filter(e => e.status?.toLowerCase() == 'awarded').length;
        let rejecteCount = vcData.filter(e => e.status?.toLowerCase() == 'rejected').length;
        let appliedCount = vcData.filter(e => e.status?.toLowerCase() == 'applied').length;
        let concludeCount = vcData.filter(e => e.status?.toLowerCase() == 'concluded').length;
        let escalatedCount = vcData.filter(e => e.status?.toLowerCase() == 'escalated').length;
        let totalVcCount = vcOpen + vcClose

          /**
         * ****************** pc records  ********************
         */

        let pcData = await SurvivorPc.find({
            $and: [
                {is_deleted: false},
                {createdAt: {$gt: start_date, $lte: end_date}},
                {survivor: {$in: survivorIds}}
            ]
        })

        pcData.map(e => e.source = e.source.toLowerCase())
        pcData.map(e => {
            if (e.result_of_pc != null) {
                e.result_of_pc = e?.result_of_pc.toLowerCase()
            } else {
                e.result_of_pc = 'awaiting'
            }
        })

        let pcCount = pcData.length;

        //console.log(pcCount);

        let pcOpen = pcData.filter(e=>e.result_of_pc?.toLowerCase() == 'awaiting').length;
        let pcClose = pcData.filter(e=>e.result_of_pc?.toLowerCase() == 'success').length;
        let totalPcCount = pcOpen + pcClose


        // return res.status(200).send({pcData, pcOpen, pcClose})


        let citIds = await CIT.find({
            $and: [
                {is_deleted: false},
                {createdAt: {$gt: start_date, $lte: end_date}},
                {survivor: {$in: survivorIds}}
            ]
        }).select("_id")
        citIds = citIds.map(e => {
            return e._id;
        })

        let citData = await CitGoal.find({
            $and: [
                {is_deleted: false},
                {targeted_date: {$gt: start_date, $lte: end_date}},
                {cit_id: {$in: citIds}}
            ]
        })

        // return res.status(200).send({citIds, citData})
        

        /**
         * ****************** cit records count ********************
         */

        let citOpen = citData.filter(e=>!e.status).length;
        let citClose = citData.filter(e=>e.status).length;
        let totalcitCount = citOpen + citClose


         totalActionOpen = vcOpen + pcOpen + citOpen;

         totalActionClose = vcClose + pcClose + citClose;

         totalAction = totalActionOpen + totalActionClose;

        /**
         * ****************** pc records count ********************
         */

        let pcSource = pcData.filter(e => e.source?.toLowerCase() == 'sa')
        let pcSourceOpen = pcSource.filter(e => e.result_of_pc?.toLowerCase() == 'awaiting').length
        //console.log(pcSourceOpen);

        
        let pcSourceClose = pcSource.filter(e => e.result_of_pc?.toLowerCase() == 'success').length
        //console.log(pcSourceOpen);
        

        let pcDestination = pcData.filter(e => e.source == 'da')
        let pcDestinationOpen = pcDestination.filter(e => e.result_of_pc?.toLowerCase() == 'awaiting').length
        //console.log(pcSourceOpen);

        let pcDestinationClose = pcDestination.filter(e => e.result_of_pc?.toLowerCase() == 'success').length
        //console.log(pcSourceClose);
        
        let totalSaDaOpen = pcSourceOpen + pcDestinationOpen;
        let totalSaDaClose = pcSourceClose + pcDestinationClose;


        let citDataList = await CIT.find({
            $and: [
                {is_deleted: false},
                {createdAt: {$gt: start_date, $lte: end_date}},
                {targeted_date:{$gt: start_date, $lte: end_date} },
                {survivor: {$in: survivorIds}}
            ]
        })

        let targetedDateCount = citDataList.length;

      
        message = {
            error:false,
            message: "Action List",
            totalAction:{
                open:totalActionOpen,
                close:totalActionClose,
                total:totalAction
            },
            vc : {
                open: vcOpen,
                close: vcClose,
                total: totalVcCount
            },
            pc:{
                open:pcOpen,
                close:pcClose,
                total:totalPcCount
            },
            cit:{
                open:citOpen,
                close:citClose,
                total:totalcitCount
            },
            victimCompensation:{
                vc_application: vcDataCount,
                awarded: awardedCount,
                rejected: rejecteCount
            },
            vcStatus:{
                applied: appliedCount,
                concluded: concludeCount,
                escalated: escalatedCount,
                awarded: awardedCount,
                rejected: rejecteCount
            },
            pcRecords:{
                pcSource: pcSource.length,
                pcDestination: pcDestination.length,
                pcSourceOpen,
                pcSourceClose,
                totalSaDaOpen,
                pcDestinationOpen,
                pcDestinationClose,
                totalSaDaClose
            },
            citRehabilations:{
                totalCit:totalcitCount,
                due:citOpen,
                concluded:citClose,
                targatedDate:targetedDateCount
            }


        }
        res.status(200).send(message);


    } catch (error) {
        message = {
			error: true,
			message: "Operation Failed!",
			data: String(error),
		};
		res.status(200).send(message);
    }
})




module.exports=MonthlyReportRoute;