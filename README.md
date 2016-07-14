# Link Sharing
Share files in a secure way for free!

## Deployment

### Prerequisites
1. Node JS v6.3.0 or later with npm
2. AWS account and valid credentials to read/write from s3 (`~/.aws/credentials` file)
3. A bucket for the app to store files in.
4. A user with permissions to write to the temp directory ($TMPDIR)

### How to deploy
1. Clone repository
2. `cd link-sharing && npm install`
3. Run `webpack`
4. Edit config (not implemented yet) 
5. Run using `npm start` or `AWS_PROFILE=my-profile npm start` (Use the user with permissions)

## Notes

### # Link Sharing
Share files in a secure way for free!

## Deployment

### Prerequisites
1. Node JS v6.3.0 or later with npm
2. AWS account and valid credentials to read/write from s3 (`~/.aws/credentials` file)
3. A bucket for the app to store files in.
4. A user with permissions to write to the temp directory ($TMPDIR)

### How to deploy
1. Clone repository
2. `cd link-sharing && npm install`
3. Run `webpack`
4. Edit config (not implemented yet) 
5. Run using `npm start` or `AWS_PROFILE=my-profile npm start` (Use the user with permissions)

## Notes
1. For this project, I favor generating long links over short ones, because I assumed we would favor security over ease of use.
2. I chose S3 (Amazon Simple Storage Service) as the file storage over a database because it would be the best solution in terms of scalability; it reduces complexity in development and deployment. It also supports storing the files encrypted out of the box.
3. My "non cloud storage" choice would probably be a MongoDB database, and storing the files in GridFS
4. I chose Node JS as the server platform because of its non-blocking IO model, which seemed well fitted for handling large files and network calls.
5. I favored a relatively simple API, but one that might be slower, over an API that works faster but it is more complicated and harder to consume, due to a tight development schedule and requirement for a simple first implementation.
6. I took advantage of the relatively basic primal requirements of this project, to create a solution that does not rely on any database except S3 as the storage for files, but on a real world system, we may want to authenticate users, allow them more advanced actions, track usage, etc. Such actions would require a RDBMS/NOSQL database. In this case I would probably change the links generating mechanism to utilize it, and not save sensitive data (like the password) as part of the URL.
7. For simplicity the client and server communicate via HTTP, but in production I would use HTTPS.

### Potential enhancements
1. Although files are only accessible for 24h, they will remain in storage forever. The code prefixes each file with a date so it will be ease to write some software/service to delete old files, but nothing is implemented yet.
2. We can gain a major performance improvement by replying to an upload request with a temporarily direct access to upload to S3 in a safety manner, this would dramatically reduce server load, and increase upload speed. But comes in a price of a more complex to consume API, see http://aws.amazon.com/articles/1434. 
3. The same goes for download requests, which we can reply to with a "one time" direct link to the file in S3 instead of streaming it through the server, see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property.
4. Alternatively, we can split large files to chunks and streaming each chunk directly to S3 without saving to disk first.
5. Separating the API server form the static files (html/css/js) servers and create a versioned API (api/v1/files)
6. Client can have a ton of features, such as:
  1. Display when a link is expired.
  2. Hide the full link and give "a copy to clipboard button"
  3. Persist links to local/session storage to support navigation

