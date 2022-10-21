require("dotenv").config();
const express = require("express");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorRescue = require("../models/survivor_rescue");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargesheet = require("../models/survivor_chargesheet");
const SurvivorInvestigation = require("../models/survivor_investigation");
const Survivorpc = require("../models/survivor_pc");
const Survivorvc = require("../models/survivor_vc");
const Survivorincome = require("../models/survivor_income");
const Survivorgrant = require("../models/survivor_grant");
const Survivorloan = require("../models/survivor_loan");
const SurvivorCit = require("../models/cit");
const shelterHome = require("../models/shelter_home");
const SurvivorDocument = require("../models/survivor_document");
const SurvivorLawyer = require("../models/survivor_lawyer");
const isAuthenticate = require("../middleware/authcheck");
const moment = require("moment");
const DeletedDataRoute = express.Router();

/**
 * This method is to find all Districts
 */
DeletedDataRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        console.log(req.query);
        let deletedList = [];

        if ((req.query.module == 'survivor' && req.query.user) && !req.query.survivor) {
            if (req.query.user) {
                deletedList = await SurvivorProfile.find({
                    $and: [
                        {is_deleted: true},
                        {deleted_by: req.query.user}
                    ]
                }).sort({deleted_at: -1})
                deletedList = JSON.parse(JSON.stringify(deletedList))
                deletedList.map(e => {
                    e.trafficking_date =  moment((e?.date_of_trafficking != undefined || e?.date_of_trafficking != null) ? e?.date_of_trafficking.split("T")[0] : e?.date_of_trafficking).format('DD-MMM-YYYY');
			       return e
                })
            } else {
                message = {
                    error: true,
                    message: "User needed to get deleted "+req.query.module+" list"
                };
                res.status(200).send(message);
            }
        }
        if ((req.query.module != 'survivor' && req.query.survivor) && !req.query.user) {
            if (req.query.survivor) {
                switch (req.query.module) {
                    case "rescue":
                        deletedList = await SurvivorRescue.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "rescue_from_state",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})
                        
                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.custom_date_of_rescue = moment(e?.date_of_rescue.split("T")[0]).format('DD-MMM-YYYY');
                            e.state_name = e?.rescue_from_state?.name;
                            return e;
                        })
                        break;
                    case "fir":
                        deletedList = await SurvivorFir.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "policeStation",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.policeStation_name = e?.policeStation?.name
                            e.fir_number = e?.fir?.number;
                            e.fir_date = moment(e?.fir?.date.split("T")[0]).format('DD-MMM-YYYY');
                            return e;
                        })
                        break;
                    case "investigation":
                        deletedList = await SurvivorInvestigation.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "inv_agency_type",
                                select: "name"
                            },
                            {
                                path: "inv_agency_name",
                                select: "name"
                            },
                            {
                                path: "inv_status",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.investigation_agency_type = e?.inv_agency_type?.name;
                            e.investigation_agency_name = e?.inv_agency_name?.name;
                            return e;
                        })
                        break;
                    case "chargesheet":
                        deletedList = await SurvivorChargesheet.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.charge_sheet_number = e?.charge_sheet?.number;
                            e.charge_sheet_date = moment(e?.charge_sheet?.date.split("T")[0]).format('DD-MMM-YYYY');
                            return e;
                        })

                        break;
                    case "pc":
                        deletedList = await Survivorpc.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "survivor",
                                select: "survivor_name"
                            },
                            {
                                path: "why",
                                select: "name"
                            },
                            {
                                path: "court",
                                select: "name"
                            },
                            {
                                path: "current_status",
                                select: "name"
                            },
                            {
                                path: "result_of_prosecution",
                                select: "name"
                            },
                            {
                                path: "document_type",
                                select: "name"
                            },
                            {
                                path: "escalation_type",
                                select: "name"
                            },
                            {
                                path: "escalation_reason",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.pc_survivor_name = e?.survivor?.survivor_name;
                            e.pc_court_name = e?.court?.name;
                            e.pc_current_status = e?.current_status?.name
                            e.pc_started_date = moment(e?.started_date.split("T")[0]).format('DD-MMM-YYYY');
                            return e;
                        })

                        break;
                    case "vc":
                        deletedList = await Survivorvc.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "survivor",
                                select: "survivor_name"
                            },
                            {
                                path: "lawyer",
                                select: "name"
                            },
                            {
                                path: "applied_at",
                                select: "name"
                            },
                            {
                                path: "authority",
                                select: "name"
                            },
                            {
                                path: "vc_status",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.applied_vc_date = moment(e?.applied_date.split("T")[0]).format('DD-MMM-YYYY');
                            e.amount_received_in_bank_date_Vc =  moment((e?.amount_received_in_bank_date != undefined || e?.amount_received_in_bank_date != null) ? e?.amount_received_in_bank_date.split("T")[0] : e?.amount_received_in_bank_date).format('DD-MMM-YYYY');
                            e.survivor_name = e?.survivor?.survivor_name
                            e.applied_at_vc = e?.applied_at?.name
                            e.lawyer_name = e?.lawyer?.name
                            e.totalEscalation_vc = JSON.stringify(e?.totalEscalation)
                            return e
                        })
                        
                        break;
                    case "income":
                        deletedList = await Survivorincome.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "income_mode",
                                select: "name"
                            },
                            {
                                path: "income_type",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})
                        
                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.earning_mode = e?.income_mode?.name
                            e.updated_date =  moment(e?.updatedAt.split("T")[0]).format('DD-MMM-YYYY');
                            return e
                        })

                        break;
                    case "grant":
                        deletedList = await Survivorgrant.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "name_of_grant_compensation",
                                select: "name"
                            },
                            {
                                path: "purpose_of_grant_id",
                                select: "name"
                            },
                            {
                                path: "grant_status",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.grant_name = e?.name_of_grant_compensation?.name
                            e.applied_date =  moment(e?.applied_on.split("T")[0]).format('DD-MMM-YYYY')
                            return e
                        })
                        break;
                    case "loan":
                        deletedList = await Survivorloan.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "loan_Where",
                                select: "name"
                            },
                            {
                                path: "loan_purpose",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})
                        
                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.where_name = e?.loan_Where?.name
                            e.purpose_name = e?.loan_purpose?.name
                            e.loan_received_on =  moment((e?.received_on != undefined || e?.received_on != null) ? e?.received_on.split("T")[0] : e?.received_on).format('DD-MMM-YYYY')
                            e.loan_updated_date =  moment((e?.updatedAt != undefined || e?.updatedAt != null) ? e?.updatedAt.split("T")[0] : e?.updatedAt).format('DD-MMM-YYYY')
                            e.rate_loan = JSON.stringify(e?.rate)
                            return e
                        })

                        break;
                    case "cit":
                        deletedList = await SurvivorCit.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "status_of_cit",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.custom_survivor_name = e.survivor?.survivor_name;
                            e.cit_assessment_date =  moment(e?.assessment_date.split("T")[0]).format('DD-MMM-YYYY');
                            e.cit_next_assesment_date =  moment(e?.next_assesment_date.split("T")[0]).format('DD-MMM-YYYY');
                            e.approval_data = e.approval? 'YES' : 'NO'
                            return e;
                        })

                        break;
                    case "shelterHome":
                        deletedList = await shelterHome.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.shelter_from_date =  moment(e?.from_date.split("T")[0]).format('DD-MMM-YYYY');
                            e.shelter_to_date =  moment(e?.to_date.split("T")[0]).format('DD-MMM-YYYY');
                            return e
                        })

                        break;
                    case "document":
                        deletedList = await SurvivorDocument.find({
                            $and: [
                                {is_deleted: true},
                                {survivor_profile: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "document_type",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})

                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.is_required_data = e.is_required? 'YES' : 'NO'
                            e.created_date = moment (e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
                            return e
                        })

                        break;
                    case "lawyer":
                        deletedList = await SurvivorLawyer.find({
                            $and: [
                                {is_deleted: true},
                                {survivor: req.query.survivor}
                            ]
                        }).populate([
                            {
                                path: "name",
                                select: "name"
                            },
                            {
                                path: "type",
                                select: "name"
                            }
                        ]).sort({deleted_at: -1})
                        
                        deletedList = JSON.parse(JSON.stringify(deletedList))
                        deletedList.map(e => {
                            e.lawyer_name = e?.name?.name
                            e.lawyer_type = e?.type?.name
                            e.fromDate =  moment(e?.from_date.split("T")[0]).format('DD-MMM-YYYY')
                            e.toDate =  moment(e?.to_date.split("T")[0]).format('DD-MMM-YYYY')
                            e.isleading_data = e.isleading? 'YES' : 'NO'
                            return e
                        })

                        break;
                
                    default:
                        deletedList = [];
                        break;
                }
            } else {
                message = {
                    error: true,
                    message: "Survivor needed to get deleted "+req.query.module+" list"
                };
                res.status(200).send(message);
            }
        }

        message = {
            error: false,
            message: "All Deleted list",
            data: deletedList,
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

module.exports = DeletedDataRoute;