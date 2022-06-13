export class UploadFileHelper {
	static customFileName(req, file, cb) {
		let fileExtension = '';
		if (file.mimetype.indexOf('jpeg') > -1) {
			fileExtension = 'jpg';
		} else if (file.mimetype.indexOf('png') > -1) {
			fileExtension = 'png';
		}
		const originalName = file.originalname.split('.')[0];
		cb(null, req.user.id + '.' + fileExtension);
	}

	static destinationPath(cb) {
		cb(null, '../upload');
	}
}

export default UploadFileHelper;
