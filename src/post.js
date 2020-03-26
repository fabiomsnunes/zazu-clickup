const utils = require('./utils');
const pkg = require('../package.json');
const axios = require('axios')
const headers = {
	'Content-Type': 'application/json',
	'Authorization': pkg.api_key
}

module.exports = (pluginContext) => {
	return (task, env = {}) => {
		return new Promise((resolve, reject) => {
			let data = {
				name: utils.getTaskName(task),
				content: utils.getTaskDescription(task),
				assignees: pkg.assignees,
				status: "Open",
				due_date: utils.getTaskDueDate(task),
				due_date_time: true,
				time_estimate: utils.getTaskTimeEstimate(task),
				priority: utils.getTaskPriority(task),
				notify_all: pkg.notify_all,
			}

			if (data.due_date && data.time_estimate){
				data.start_date = data.due_date - data.time_estimate;
				data.start_date_time = true;
			}
			axios.post(pkg.api_url + '/list/' + pkg.list_id + '/task', JSON.stringify(data), {headers: headers})
			.then(function (res) {
				resolve('Task "' + data.name + '" created!')
			})
			.catch(function (error) {
				resolve(error)
			})
		});
	};
};

