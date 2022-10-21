const express = require("express");
const router = express.Router();


const tokenRouter = require("./routes/token_route");
const fileUploadRouter = require("./routes/file_upload_route");
const moduleRouter = require("./routes/module_route");
const roleRouter = require("./routes/role_route");
const roleModuleRouter = require("./routes/role_module_route");
const organizationRouter = require("./routes/organization_route");
const userRouter = require("./routes/user_routes");
const adminRouter = require("./routes/admin_route");
const stateRouter = require("./routes/state_route");
const districtRouter = require("./routes/district_route");
const blockRouter = require("./routes/block_route");
const policeStationRouter = require("./routes/police_station_route");
const shgRouter = require("./routes/shg_route");
const collectiveRouter = require("./routes/collective_route");
const courtRouter = require("./routes/court_route");
const lawyerCategoryRouter = require("./routes/lawyer_category_route");
const lawyerRouter = require("./routes/lawyer_route");
const SurvivorProfileRouter = require("./routes/survivor_profile_route");
const SurvivorDocumentRoute = require("./routes/survivor_document_route");
const SurvivorRescueRouter = require("./routes/survivor_rescue_route");
const SurvivorFirrouter = require("./routes/survivor_fir_route");
const SurvivorChargesheetrouter = require("./routes/survivor_chargesheet_route");
const SurvivorInvestigationRoute = require("./routes/survivor_investigation_route");
const SurvivorNextplanActionRoute = require("./routes/survivor_nextPlan_action_route");
const SurvivorPcRoute = require("./routes/survivor_pc_route");
const SurvivorVcrouter = require("./routes/survivor_vc_route");
const SurvivorIncomeRouter = require("./routes/survivor_income_route");
const SurvivorGrantRouter = require("./routes/survivor_grant_route");
const SurvivorFamilyRoute = require("./routes/survivor_family_route");
const VcEscalationrouter = require("./routes/vc_escalation_route");
const PcEscalationrouter = require("./routes/pc_escalation_route");
const SurvivorParticipationrouter = require("./routes/survivor_participation_route");
const SurvivorLoanrouter = require("./routes/survivor_loan_route");
const TraffickerProfileRouter = require("./routes/trafficker_profile_route");
const SurvivorDiaryRoute = require("./routes/survivor_diary_route");
const SrvTraffickerProfileRoute = require("./routes/survivor_trafficker_profile");

const SheltereHomeRoute = require("./routes/shelter_home_route");
const ShelterHomeQuestionRoute = require("./routes/shelter_home_question_route");
const CitDimensionRoute = require("./routes/cit_dimension_route");
const MortgageRoute = require("./routes/mortgage_route");
const GrantRoute = require("./routes/grant_route");
const DocumentRoute = require("./routes/document_route");
const PartnerRoute = require("./routes/partner_route");
const AuthorityTypeRoute = require("./routes/authority_type_route");
const AuthorityRoute = require("./routes/authority_route");
const PcWhyRoute = require("./routes/pcroutes/pc_why_route");
const PcCurrentStatusRoute = require("./routes/pcroutes/pc_current_status_route");
const ResOfProsecutionRoute = require("./routes/pcroutes/res_of_prosecution_route");
const DocumentTypeRoute = require("./routes/pcroutes/document_type_route");
const EscalatedTypeRoute = require("./routes/pcroutes/escalated_type_route");
const EscalatedReasonRoute = require("./routes/pcroutes/escalated_reason_route");
const CitDimensionQuestionRoute = require("./routes/cit_dimension_question_route");
const SurvivorLawyerRoute = require("./routes/survivor_lawyer_route");
const SurvivorDashboardRoute = require("./routes/survivor_dashboard_route");
const CITRoute = require("./routes/cit_route");
const CITVersionRoute = require("./routes/cit_version_route");
const CitDetailRoute = require("./routes/cit_detail_route");
const CitGoalRoute = require("./routes/cit_goal_route");

const SupplementaryFirRoute = require("./routes/supplementary_fir_route");
const AdminDashboardRoute = require("./routes/admin_dashboard_route")

//const SupplementaryFirRoute = require("./routes/supplementary_fir_route");
const ActRoute = require("./routes/act_route");
const SectionRoute = require("./routes/section_route");
const SupplimentaryChargesheetRoute = require("./routes/supplimentary_chargesheet_route");
const ChangeLogRoute = require("./routes/changelog_route");

const CitStatusRoute = require("./routes/status_master/cit_status_route");
const GrantStatusRoute = require("./routes/status_master/grant_status_route");
//const DiaryStatusRoute = require("./routes/status_master/diary_route");
const InvestigationStatusRoute = require("./routes/status_master/investigation_status_route");
const DiaryStatusRoute = require("./routes/status_master/diary_status_route");
const VcStatusRoute = require("./routes/status_master/vc_status_route");
const SurvivorStatusRoute = require("./routes/status_master/survivor_status_route");
const NotificationRoute = require("./routes/notification_route");
const PendingAcationRoute = require("./routes/pending_action_route");
const DeletedDataRoute = require("./routes/deleted_data_route");
const RoleModuleUserRoute = require("./routes/role_module_user_route");
const MonthlyReportRoute = require("./routes/monthly_report_route");
const TraffickerActionRoute = require("./routes/survivor_trafficker_action_route");
const CityRoute = require("./routes/city_route");
//const MonthlyReport2Route = require("./routes/monthly_report2_route");

const InvestigationResultRoute = require("./routes/result_master/investigation_result_route");
const VcResultRoute = require("./routes/result_master/vc_result_route");
const PcResultRoute = require("./routes/result_master/pc_result_route");
const PcescalationResultRoute = require("./routes/result_master/pc_escalation_result_route");
const VcEscalationResultRoute = require("./routes/result_master/vc_escalation_result_route");


const InvAgencyTypeRoute = require("./routes/type_of_agency_route");
const AgencyRoute = require("./routes/agency_route");
const LoanWhereRoute = require("./routes/loan_where_route");
const EarningTypeRoute = require("./routes/income_type_route");
const ModeOfEarningRoute = require("./routes/mode_of_earnings_route");
const PurposeOfLoanRoute = require("./routes/loan_purpose_route");
const PurposeOfGrantRoute = require("./routes/purpose_of_grant_route");




router.use("/token", tokenRouter);
router.use("/file", fileUploadRouter);
router.use("/module", moduleRouter);
router.use("/role", roleRouter);
router.use("/role-module", roleModuleRouter);
router.use("/organization", organizationRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/state", stateRouter);
router.use("/district", districtRouter);
router.use("/block", blockRouter);
router.use("/police-station", policeStationRouter);
router.use("/shg", shgRouter);
router.use("/collective", collectiveRouter);
router.use("/court", courtRouter);
router.use("/lawyer-category", lawyerCategoryRouter);
router.use("/lawyer", lawyerRouter);
router.use("/survival-profile", SurvivorProfileRouter);
router.use("/survival-document", SurvivorDocumentRoute);
router.use("/survival-rescue", SurvivorRescueRouter);
router.use("/survival-fir", SurvivorFirrouter);
router.use("/survival-chargesheet", SurvivorChargesheetrouter);
router.use("/survival-investigation", SurvivorInvestigationRoute);
router.use("/survival-nextplanaction", SurvivorNextplanActionRoute);
router.use("/survival-pc", SurvivorPcRoute);
router.use("/survival-vc", SurvivorVcrouter);
router.use("/shelter-home", SheltereHomeRoute);
router.use("/shelter-home-question", ShelterHomeQuestionRoute)
router.use("/cit-dimension", CitDimensionRoute);
router.use("/vc-escalation", VcEscalationrouter);
router.use("/pc-escalation", PcEscalationrouter);
router.use("/survival-income", SurvivorIncomeRouter);
router.use("/survival-grant", SurvivorGrantRouter);
router.use("/survival-family", SurvivorFamilyRoute);
router.use("/survival-participation", SurvivorParticipationrouter);
router.use("/survival-loan", SurvivorLoanrouter);
router.use("/survival-trafficker", SrvTraffickerProfileRoute);
router.use("/trafficker-profile", TraffickerProfileRouter);
router.use("/survival-diary", SurvivorDiaryRoute);

router.use("/mortgage", MortgageRoute);
router.use("/grant", GrantRoute);
router.use("/document", DocumentRoute);
router.use("/partner", PartnerRoute);
router.use("/authority_type", AuthorityTypeRoute);
router.use("/authority", AuthorityRoute);
router.use("/pcwhy", PcWhyRoute);
router.use("/pc-current-status", PcCurrentStatusRoute);
router.use("/res-of-prosecution", ResOfProsecutionRoute);
router.use("/document-type", DocumentTypeRoute);
router.use("/escalated-type", EscalatedTypeRoute);
router.use("/escalated-reason", EscalatedReasonRoute);
router.use("/cit-dimension-question", CitDimensionQuestionRoute);
router.use("/survivor-lawyer", SurvivorLawyerRoute);
router.use("/survivor-dashboard", SurvivorDashboardRoute);
router.use("/cit", CITRoute);
router.use("/cit-version", CITVersionRoute);
router.use("/cit_detail", CitDetailRoute);
router.use("/cit-goal", CitGoalRoute);

router.use("/supplementary-fir", SupplementaryFirRoute);
router.use("/admin-dashboard", AdminDashboardRoute);
    //router.use("/supplementary-fir",SupplementaryFirRoute);
router.use("/act", ActRoute);
router.use("/section", SectionRoute);
router.use("/supplimentary-chargesheet", SupplimentaryChargesheetRoute);
router.use("/change-log",ChangeLogRoute);

router.use("/cit-status", CitStatusRoute);
router.use("/grant-status", GrantStatusRoute);
//router.use("/diary-status", DiaryStatusRoute);
router.use("/investigation-status", InvestigationStatusRoute);
router.use("/diary-status", DiaryStatusRoute);
router.use("/vc-status", VcStatusRoute);
router.use("/survivor-status", SurvivorStatusRoute);
router.use("/notification", NotificationRoute);
router.use("/pending-action", PendingAcationRoute);
router.use("/deleted-data", DeletedDataRoute);
router.use("/role-module-user",RoleModuleUserRoute);
router.use("/monthly-report",MonthlyReportRoute);
router.use("/trafficker-action",TraffickerActionRoute);
router.use("/city",CityRoute);
//router.use("/monthly-report-copy",MonthlyReport2Route);
router.use("/investigation-result",InvestigationResultRoute);
router.use("/vc-result",VcResultRoute);
router.use("/pc-result",PcResultRoute);
router.use("/pc-escalation-result",PcescalationResultRoute);
router.use("/vc-escalation-result",VcEscalationResultRoute);

router.use("/type-of-agency",InvAgencyTypeRoute);
router.use("/agency",AgencyRoute);
router.use("/where",LoanWhereRoute);
router.use("/income-type",EarningTypeRoute);
router.use("/mode-of-earning",ModeOfEarningRoute);
router.use("/loan-purpose",PurposeOfLoanRoute);
router.use("/purpose-of-grant",PurposeOfGrantRoute);


module.exports = router;