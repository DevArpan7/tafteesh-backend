require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const DiaryStatus = require("../../models/status_master/diary_status");
const SurvivorDiary = require("../../models/survivor_diary");
const DiaryStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
 DiaryStatusRoute.get("/list", async (req, res) => {
    try {
        let StatusData = await DiaryStatus.find({ is_deleted: false }).sort({_id:-1});

		let customDiaryStatusData = JSON.parse(JSON.stringify(StatusData))

		customDiaryStatusData.map(e => {
			e.diaryStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All diary Status list",
            data: customDiaryStatusData,
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

/**
 * This method is to create Status
 */
 DiaryStatusRoute.post("/create", async (req, res) => {
	try {
		const checkDiaryStatus = await DiaryStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkDiaryStatus.length){
			for (let index = 0; index < checkDiaryStatus.length; index++) {
				if(checkDiaryStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An diary status already exists with this name!"})
				}
			}
		}

		const StatusData = new DiaryStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "Status Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Status Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update status
 * @param str diarystatusId
 */
 DiaryStatusRoute.patch("/update/:diarystatusId", async (req, res) => {
	try {
		const diaryStatusData = await DiaryStatus.findOne({ _id: req.params.diarystatusId }) 
		const existenceCheck1 = await SurvivorDiary.findOne({$or: [{status: diaryStatusData?.name}, {diary_status: diaryStatusData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This diary status exists in other module. Can not be updated."});

		const checkDiaryStatus = await DiaryStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkDiaryStatus.length){
			for (let index = 0; index < checkDiaryStatus.length; index++) {
				if(checkDiaryStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An diary status already exists with this name!"})
				}
			}
		}

		const result = await DiaryStatus.findOneAndUpdate({ _id: req.params.diarystatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Diary Status updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Diary Status not updated",
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
 * This method is to delete State
 * @param str diarystatusId
 */
 DiaryStatusRoute.patch("/delete/:diarystatusId", async (req, res) => {
	try {
		const diaryStatusData = await DiaryStatus.findOne({ _id: req.params.diarystatusId }) 
		const existenceCheck1 = await SurvivorDiary.findOne({$or: [{status: diaryStatusData?.name}, {diary_status: diaryStatusData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This diary status exists in other module. Can not be deleted."});

		const result = await DiaryStatus.findOneAndUpdate({ _id: req.params.diarystatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "Diary Status deleted successfully!",
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


module.exports = DiaryStatusRoute;