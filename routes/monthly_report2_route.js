// require("dotenv").config();
// const express = require("express");
// const SurvivorProfile = require("../models/survivor_profile");
// const SurvivorDiary = require("../models/survivor_diary");
// const SurvivorVc = require("../models/survivor_vc");
// const SurvivorPc = require("../models/survivor_pc");
// const CIT = require("../models/cit");
// const VcStatus = require("../models/status_master/vc_status");
// const citStatus = require("../models/status_master/cit_status");
// const DiaryStatus = require("../models/status_master/diary_status");
// const SurvivorStatus = require("../models/status_master/survivor_status");
// const { Console } = require("winston/lib/winston/transports");
// const MonthlyReport2Route = express.Router();

// //survivors count by month


// MonthlyReport2Route.get("/all-list/:SocialWorkerId", async(req,res)=>{
//     try{
//         let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
//         const start_date = new Date("08-01-2022");
//         const end_date = new Date("08-31-2022");

//         let survivorData = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]})

//         let survivorIds = survivorData.map(e => e._id.toString())
        
        
//         let survivorStatusData = await SurvivorStatus.find(); // This is survivor master status list
//         let survivorActive = survivorData.filter(e => String(e.surv_status) == survivorStatusData.find(e => e.name.toLowerCase() == 'active')?._id); // This is active survivor data 

//         let survivorDropOut = survivorData.filter(e => String(e.surv_status) == survivorStatusData.find(e => e.name.toLowerCase() == 'dropped-out')?._id);// This is active survivor data 


//         let survivorVcData = await SurvivorVc.find({$and:[{survivor: {$in: survivorIds}},{ is_deleted: false }]});
//         //console.log(survivorVcData);

//         let vcSa = survivorVcData.filter(e => e.source == 'sa')
//         let vcDa = survivorVcData.filter(e => e.source == 'da')


//         let survivorPcData = await SurvivorPc.find({$and:[{survivor: {$in: survivorIds}},{ is_deleted: false }]});

       
//         let pcSa = survivorPcData.filter(e => e.source == 'sa')
//         let pcDa = survivorPcData.filter(e => e.source == 'da')
        
    
//         message = {
//             error:false,
//             message: "Monthly report",
//             survivor:{
//                 totalSurvivor:survivorData.length,
//                 totalActive:survivorActive.length,
//                 totalDropOUt:survivorDropOut.length,
//             },
//             VC:{
//                 totalVc:survivorVcData.length,
//                 totalVcSa:vcSa.length,
//                 totalVcDa:vcDa.length
//             },
//             PC:{
//                 totalPc:survivorPcData.length,
//                 totalPcSa:pcSa.length,
//                 totalPcDa:pcDa.length
//             }
            

//         }
//         res.status(200).send(message);

//     }catch(err){
//         message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: err,
// 		};
// 		res.status(200).send(message);
//     }
    
// })

// // MonthlyReport2Route.get("/survivor-and-engagement-count/:SocialWorkerId", async(req,res)=>{
// //     try{
// //         let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
// //         const start_date = new Date("07-01-2022");
// //         const end_date = new Date("07-31-2022");

// //         const next_start_date = new Date("08-01-2022");
// //         const next_end_date = new Date("08-31-2022");

// //         let diaryStatusData = await DiaryStatus.find(); // This is Diary master status list

// //         console.log(diaryStatusData);

// //         /**
// //          * ****************** Survivor section ********************
// //          */
// //         let monthWiseSurvivor = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]})
// //         let totalSurvivor = monthWiseSurvivor.length
// //         let monthWiseApprovedSurvivor = monthWiseSurvivor.filter(e=>e.approval==true);
// //         let monthWiseNotApprovedSurvivor = monthWiseSurvivor.filter(e=>e.approval==false);
// //         //let activeSurvivor = monthWiseSurvivor.filter(e=>e.status_in_tafteesh=='active');
// //         let dropoutSurvivor = monthWiseSurvivor.filter(e=>e.status_in_tafteesh=='dropped-out');

// //         /**
// //          * ****************** Engagement section ********************
// //          */
        
// //         let monthWiseEngagement = await SurvivorDiary.find({$and:[{user:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]});
// //         let monthWiseEngagementConducted = monthWiseEngagement.filter(e => e.status == 'Completed');
// //         let nextMonthWiseEngagement = await SurvivorDiary.find({$and:[{user:req.params.SocialWorkerId},{createdAt:{ $gte: next_start_date, $lte: next_end_date }}, { is_deleted: false }]});


// //         message = {
// //             error:false,
// //             message: "Monthly report",
// //             survivordata : {
// //                 totalSurvivor,
// //                 totalApprovedSurvivor: monthWiseNotApprovedSurvivor.length,
// //                 totalNotApprovedSurvivor: monthWiseApprovedSurvivor.length,
// //                 totalDropOutSurvivor: dropoutSurvivor.length,
// //             },
// //             diarydata : {
// //                 totalDairy: monthWiseEngagement.length,
// //                 totalConducted: monthWiseEngagementConducted.length,
// //                 nextMonth: nextMonthWiseEngagement.length
// //             }

// //         }
// //         res.status(200).send(message);


// //     }catch(err){
// //         message = {
// // 			error: true,
// // 			message: "Operation Failed!",
// // 			data: err,
// // 		};
// // 		res.status(200).send(message);
// //     }


// // })

// // MonthlyReport2Route.get("/engagement-list/:socialWorkerId", async(req,res)=>{
// //     try{
// //         let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
// //         const start_date = new Date("07-01-2022");
// //         const end_date = new Date("07-31-2022");

// //         const next_start_date = new Date("08-01-2022");
// //         const next_end_date = new Date("08-31-2022");



// //         /**
// //          * ****************** engagement detail section ********************
// //          */
// //         let monthlySurvivorsDiary = await SurvivorDiary.find(
// //             {$and:
// //                 [
// //                     { user: req.params.socialWorkerId},
// //                     { is_deleted: false }
// //                 ]
// //             }
// //         ).distinct("survivor");

// //         let survivors = await SurvivorProfile.find({
// //             _id: {$in: monthlySurvivorsDiary}
// //         }).select("survivor_name")

// //         let engagementListDetail = [];

// //         for (let index = 0; index < survivors.length; index++) {
// //             let currentMonthData = await SurvivorDiary.find(
// //                 {$and:
// //                     [
// //                         { survivor: survivors[index]?._id },
// //                         { user: req.params.socialWorkerId },
// //                         {
// //                             createdAt: { $gte: start_date, $lte: end_date }
// //                         },
// //                         { is_deleted: false }
// //                     ]
// //                 }
// //             )

// //             let nextMonthData = await SurvivorDiary.find(
// //                 {$and:
// //                     [
// //                         { survivor: survivors[index]?._id },
// //                         { user: req.params.socialWorkerId },
// //                         {
// //                             createdAt: { $gte: next_start_date, $lte: next_end_date }
// //                         },
// //                         { is_deleted: false }
// //                     ]
// //                 }
// //             )

// //             engagementListDetail.push({
// //                 survivor: {
// //                     name: survivors[index]?.survivor_name,
// //                     id: survivors[index]?._id
// //                 },
// //                 planned: currentMonthData.length,
// //                 conducted: currentMonthData.filter(e => e.status == 'Completed').length,
// //                 next: nextMonthData.length
// //             })
// //         }

// //         res.status(200).send(engagementListDetail);


// //     }catch(err){
// //         message = {
// // 			error: true,
// // 			message: "Operation Failed!",
// // 			data: err,
// // 		};
// // 		res.status(200).send(message);
// //     }


// // })

// MonthlyReport2Route.get("/action-list-count/:SocialWorkerId", async(req,res)=>{
//     try {
//         let months = ["jan","feb","mar","apr","may","june","july","aug","sep","oct","nov","dec"];
//         const start_date = new Date("08-01-2022");
//         const end_date = new Date("08-31-2022");

//         let survivorData = await SurvivorProfile.find({$and:[{user_id:req.params.SocialWorkerId},{createdAt:{ $gte: start_date, $lte: end_date }}, { is_deleted: false }]})

//         let survivorIds = survivorData.map(e => e._id.toString())

//         /**
//          * ****************** action list count ********************
//          */


//         /**
//          * ****************** vc records count ********************
//          */



//         let vcData = await SurvivorVc.find({
//             $and: [
//                 {is_deleted: false},
//                 {createdAt: {$gte: start_date, $lte: end_date}},
//                 {survivor: {$in: survivorIds}}
//             ]
//         })
//         // console.log(vcData);
//         let vcCount = vcData.length
//            //console.log(vcCount);
//         let vcSaCount = vcData.filter(e => e.source == 'sa');
//         let vcdaCount = vcData.filter(e => e.source == 'da');

//         let vcOpen = vcData.filter(e=>e.result=='awaiting').length;
//         let vcClose = vcData.filter(e=>e.result=='awarded').length;

//         let awardedCount = vcData.filter(e=>e.status=='Awarded').length;
//         let rejecteCount = vcData.filter(e=>e.status=='Rejected').length;
//         let appliedCount = vcData.filter(e=>e.status=='Applied').length;
//         let concludeCount = vcData.filter(e=>e.status=='Concluded').length;
//         let escalatedCount = vcData.filter(e=>e.status=='Escalated').length;
//         let totalVcCount = vcOpen + vcClose

//           /**
//          * ****************** pc records  ********************
//          */

//         let pcData = await SurvivorPc.find({
//             $and: [
//                 {is_deleted: false},
//                 {createdAt: {$gte: start_date, $lte: end_date}},
//                 {survivor: {$in: survivorIds}}
//             ]
//         })

//         let pcCount = pcData.length;

//         //console.log(pcCount);

//         let pcOpen = pcData.filter(e=>e.result_of_pc=='awaiting').length;
//         let pcClose = pcData.filter(e=>e.result_of_pc=='success').length;
//         let totalPcCount = pcOpen + pcClose



//         let citData = await CIT.find({
//             $and: [
//                 {is_deleted: false},
//                 {createdAt: {$gte: start_date, $lte: end_date}},
//                 {survivor: {$in: survivorIds}}
//             ]
//         })

//         /**
//          * ****************** cit records count ********************
//          */

//         let citOpen = citData.filter(e=>e.status=='ongoing').length;
//         let citClose = citData.filter(e=>e.status=='closed').length;
//         let totalcitCount = citOpen + citClose


//          totalActionOpen = vcOpen + pcOpen + citOpen;

//          totalActionClose = vcClose + pcClose + citClose;

//          totalAction = totalActionOpen + totalActionClose;

//         /**
//          * ****************** pc records count ********************
//          */

//         pcSource = pcData.filter(e => e.source == 'sa')
//         pcSourceOpen = pcSource.filter(e => e.result_of_pc == 'awaiting').length
//         //console.log(pcSourceOpen);

        
//         pcSourceClose = pcSource.filter(e => e.result_of_pc == 'success').length
//         //console.log(pcSourceOpen);
        

//         pcDestination = pcData.filter(e => e.source == 'da')
//         pcDestinationOpen = pcDestination.filter(e => e.result_of_pc == 'awaiting').length
//         //console.log(pcSourceOpen);

//         pcDestinationClose = pcDestination.filter(e => e.result_of_pc == 'success').length
//         //console.log(pcSourceClose);
        
//         totalSaDaOpen = pcSourceOpen + pcDestinationOpen;
//         totalSaDaClose = pcSourceClose + pcDestinationClose;
      
//         message = {
//             error:false,
//             message: "Action List",
//             totalAction:{
//                 open:totalActionOpen,
//                 close:totalActionClose,
//                 total:totalAction
//             },
//             vc : {
//                 open: vcOpen,
//                 close: vcClose,
//                 total: totalVcCount
//             },
//             pc:{
//                 open:pcOpen,
//                 close:pcClose,
//                 total:totalPcCount
//             },
//             cit:{
//                 open:citOpen,
//                 close:citClose,
//                 total:totalcitCount
//             },
//             victimCompensation:{
//                 vc_application: vcCount,
//                 awarded: awardedCount,
//                 rejected: rejecteCount
//             },
//             vcStatus:{
//                 applied: appliedCount,
//                 concluded: concludeCount,
//                 escalated: escalatedCount
//             },
//             pcRecords:{
//                 pcSourceOpen,
//                 pcSourceClose,
//                 totalSaDaOpen,
//                 pcDestinationOpen,
//                 pcDestinationClose,
//                 totalSaDaClose
//             },
//             citRehabilations:{
//                 totalCit:totalcitCount,
//                 due:citOpen,
//                 concluded:citClose
//             }


//         }
//         res.status(200).send(message);


//     } catch (error) {
//         message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: error,
// 		};
// 		res.status(200).send(message);
//     }
// })




// module.exports=MonthlyReport2Route;