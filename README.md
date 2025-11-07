# Simple File Upload Backend

A lightweight Node.js + Express backend for uploading files to **Google Cloud Storage**, deployed using **Google Cloud Run**.  
This project demonstrates end-to-end file handling — from a frontend upload request to cloud storage and a public file URL response.

---

## Objective

This project was built to:
-> Create a simple backend for uploading files securely to Google Cloud Storage.
-> Provide an easily deployable containerized backend using Docker and Cloud Run.
-> Provide the Deployed Frontend link so that it can be accessed anywhere
-> Demonstrate full integration with Google Cloud.

---

## Features

-> Upload files directly from a frontend (HTML)  
-> Store uploaded files inside a Cloud Storage bucket  
-> Get public URLs for uploaded files instantly  
-> Simple and portable — runs locally or on Cloud Run  
-> Fully configured for CORS access from any frontend

---

## Setup Steps

### Step 1: Setting up the Project Repository:

        mkdir file-upload-backend
        mkdir file-upload-frontend

### Step 2: Configuring the Backend:

        cd file-upload-backend
        npm init -y
        npm install express dotenv multer cors @google-cloud/storage

        Then Create the main server file:
        "server.js"
        and create the .env file for the storage bucket name
        ".env" with the data as below:
        GOOGLE_BUCKET_NAME=<YOUR-STORAGE-BUCKET-NAME>

### Step 3: Authenticate with the Google Cloud locally:

        Used the Google Cloud CLI for authentication:

        gcloud init
        gcloud auth application-default login
        gcloud config set project <Your-Project-ID>

        This is will make sure that the project runs locally and also deploy the project in the cloud run

### Step 4: Create a Google Cloud Storage Bucket:

        I have created a bucket in the Google Cloud Console:
        -> Region : asia-south1
        -> Access-type : Fine-grained ( which makes the bucket to be available in the public domain)
        -> Name: simple-file-uploader
        Then i noted the bucket name and updated it in the .env file

### Step 5: Write the backend code :

        I have added the code of the server.js in the backend folder , check it if for reference

### Step 6: Running the Application locally:

        by using the command
        node server.js
        we can access the backend with the help of the frontend.

### Step 7: Adding Docker to deploy the Website:

        Create a DockerFile in the same folder:
        which should look like the below :
        "
            FROM node:18
            WORKDIR /usr/src/app
            COPY package*.json ./
            RUN npm install
            COPY . .
            EXPOSE 8080
            CMD ["node", "server.js"]
        "

### Step 8: Build and push to Artifact Registry:

        Created a Docker repository in Artifact Registry by using :
        " gcloud artifacts repositories create file-upload-backend --repository-format=docker --location=asia-south1 "

        Then build and pushed the image:

        " gcloud builds submit --tag asia-south1-docker.pkg.dev/<project-id>/file-upload-backend/file-upload-backend "

### Step 9: Deploy the Google Cloud Run:

        Finally by using the below command , the image is deployed publicly:

        "
            gcloud run deploy file-upload-backend \
            --image asia-south1-docker.pkg.dev/<project-id>/file-upload-backend/file-upload-backend \
            --region asia-south1 \
            --allow-unauthenticated \
            --set-env-vars GOOGLE_BUCKET_NAME=<YOUR-BUCKET-NAME>
        "
        Once it is deployed we will receive a link which is in the below format:

        " https://file-upload-backend-<project-id>.asia-south1.run.app "

### Step 10: Building the Frontend:

        I have Created a simple html page to upload files to the storage bucket we created and have sent a upload request to the backend url to "/upload" route.

### Step 11: Deploy the Frontend using Vercel:

        I have created the Vercel repo and have deployed the frontend html file.

### Tech Stack:

    -> Backend : Node.js , Express.js
    -> Frontend: HTML
    -> File Uploads: Multer (in-memory)
    -> Cloud Services: Google Cloud Storage
    -> Deployment: Docker (Backend) , Vercel (Frontend)

### Reflection of What I have Learnt:

    -> I have learnt how to deploy a project using docker.
    -> I have learnt how to integrate Node.js with Google Cloud.
