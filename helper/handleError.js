let errors = {};
// const handleError = (err) => {
// 	Object.values(err.errors).forEach(({properties}) => {
// 		errors[properties.path] = properties.message
// 	})
// 	return errors;
// }

const handleError = (err) => {
	Object.values(err.errors).forEach((error, i) => {
		errors[error.path] = error.message
	})
	return errors;
}

module.exports = handleError;