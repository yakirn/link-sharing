# Link Sharing
Share files in a secure way for free!
### prerequisites
1. NodeJS v6.3.0 or later with npm
2. AWS account and valid credentials to read/write from s3 (`~/.aws/credentials` file)
3. A bucket for the app to store files in.
4. A user with permissions to write to the temp directory ($TMPDIR)

### How to deploy
1. clone repository
2. `cd link-sharing && npm install`
3. run `webpack`
4. Edit config (not implemented yet) 
5. run using `npm start` or `AWS_PROFILE=my-profile npm start` (Use the user with permissions)

## Assumtions and potential enhancements
