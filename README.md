# Link Sharing
Share files in a secure way for free!

## Deployment

### Prerequisites
1. Node JS v6.3.0 or later with npm
2. AWS account and valid credentials to read/write from S3 (`~/.aws/credentials` file)
3. An S3 bucket for the app to store files in.

### How to deploy
1. Clone repository.
2. `cd link-sharing && npm install`.
3. Make sure you have the following environment variables set:
  1.  AWS_PROFILE - if you use a profile other than default in your aws credentials file.
  2.  PORT - the port you want the server to listen to (defaults to 8080).
  3.  NODE_ENV - (defaults to development).
4. Edit configuration file (under `/path/to/repo/config/production.json`).
5. Run using `npm start` (make sure your user has permissions to write to the temp directory ($TMPDIR) and listen in the configured port).

## Notes

### Assumtions
1. For this project, I favor generating long links over short ones, because I assumed we would favor security over links readability.
2. I chose S3 (Amazon Simple Storage Service) as the file storage over a database because it would be the best solution in terms of scalability; it reduces complexity in development and deployment; It supports storing the files encrypted out of the box, and is much more resilient to errors.
3. My "non cloud storage" choice would probably be a MongoDB database for the Meta, and storing the files in GridFS
4. I chose Node JS as the server platform because of its non-blocking IO model, which seemed well fitted for handling large files and long network calls.
5. I favored a relatively simple API, but one that might be slower, over an API that works faster but it is more complicated and harder to consume, following the requirement for a simple first implementation.
6. I took advantage of the relatively basic primal requirements of this project, to create a solution that does not rely on any database except S3 as the storage for files, but on a real world system, we may want to authenticate users, allow them more advanced actions, track usage, etc. Such actions would require a RDBMS/NOSQL database. In this case I would probably change the links generating mechanism to utilize such database, and not save sensitive data (like the password) as part of the URL, even though it is encrypted.
7. For simplicity the client and server communicate via HTTP, but in production I would use HTTPS.

### Potential enhancements
1. Although files are only accessible for 24h, they will remain in storage forever. The code prefixes each file with a date so it will be easy to write a scheduled job that deletes old files, but nothing is implemented yet.
2. The biggest potential for errors comes from the fact that we save each file the user uploads to a temp directory on disk. If several users will upload very large files simultaneously we can potentially run out of space, which would fail the uploads. To overcome this we can:
  1. Reply to an upload request with a secured form that will let the user upload directly to S3. This would dramatically reduce server load, and increase upload speed. But comes in a price of a more complex to consume API, see http://aws.amazon.com/articles/1434.
  2. Alternatively, we can split large files to chunks and stream each chunk directly to S3 without saving to disk.
3. Downloads are streamed through the server, which raise the potential of using to much memory. To overcome this we can reply with a "one time" direct link to the file in S3 instead, see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property.
4. In order to always serve the static pages fast, it is a good idea to separate the API server from the static files (html/css/js) server, this is a relatively easy refactoring to do. Also creating a versioned API (api/v1/files) is always a good idea.
5. Although I didn't try this, It shouldn't be a problem to scale out and deploy more instances of the server under a load balancer if we see memory / disk usage gets too high.
6. Client can have a ton of features, such as:
  1. Display when a link is expired.
  2. Hide the full link and give "a copy to clipboard button".
  3. Persist links to local/session storage to support navigation.



