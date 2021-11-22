using Autodesk.Forge;
using Autodesk.Forge.Client;
using Autodesk.Forge.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TestForgeApp.Helpers;
using TestForgeApp.Models;
using TestForgeApp.Models.dto;

namespace forgeSample.Controllers
{
    // controller for creating buckets and uploading models...

    [ApiController]
    public class OSSController : ControllerBase
    {
        private IWebHostEnvironment _env;
        public OSSController(IWebHostEnvironment env) { _env = env; }
        public string ClientId { get { return AppSettings.GetAppSetting("FORGE_CLIENT_ID").ToLower(); } }
        private static Random random = new Random();

        private const int UPLOAD_CHUNK_SIZE = 5; // Mb

        /// <summary>
        /// Return list of buckets (id=#) or list of objects (id=bucketKey)
        /// </summary>
        [HttpGet]
        [Route("api/forge/oss/buckets")]
        public async Task<IList<TreeNode>> GetOSSAsync(string id)
        {
            IList<TreeNode> nodes = new List<TreeNode>();
            dynamic oauth = await OAuthController.GetInternalAsync();

            if (id == "#") // root
            {
                BucketsApi appBckets = new BucketsApi();
                appBckets.Configuration.AccessToken = oauth.access_token;

                // runs only for first 100 buckets (optimisation)
                dynamic buckets = await appBckets.GetBucketsAsync("US", 100);
                foreach (KeyValuePair<string, dynamic> bucket in new DynamicDictionaryItems(buckets.items))
                {
                    nodes.Add(new TreeNode(bucket.Value.bucketKey, bucket.Value.bucketKey.Replace(ClientId + "-", string.Empty), "bucket", true));
                }
            }
            else
            {
                // as we have the id (bucketKey)
                ObjectsApi objects = new ObjectsApi();
                objects.Configuration.AccessToken = oauth.access_token;
                var objectsList = await objects.GetObjectsAsync(id, 100);
                foreach (KeyValuePair<string, dynamic> objInfo in new DynamicDictionaryItems(objectsList.items))
                {
                    nodes.Add(new TreeNode(Base64.Base64Encode((string)objInfo.Value.objectId),
                      objInfo.Value.objectKey, "object", false));
                }
            }

            return nodes;
        }

        /// <summary>
        /// Create a new bucket 
        /// </summary>
        [HttpPost]
        [Route("api/forge/oss/buckets")]
        public async Task<dynamic> CreateBucket([FromBody] CreateBucketModel bucket)
        {
            BucketsApi buckets = new BucketsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            buckets.Configuration.AccessToken = token.access_token;
            PostBucketsPayload bucketPayload = new PostBucketsPayload(string.Format("{0}-{1}", ClientId, bucket.bucketKey.ToLower()), null,
              PostBucketsPayload.PolicyKeyEnum.Persistent);
            return await buckets.CreateBucketAsync(bucketPayload, "US");
        }

        /// <summary>
        /// Receive a file from the client and upload to the bucket
        /// </summary>
        /// <returns></returns>
        //[HttpPost]
        //[Route("api/forge/oss/objects")]

        [HttpPost]
        [Route("api/uploadModel")]
        [RequestFormLimits(MultipartBodyLengthLimit = Int32.MaxValue)]
        [RequestSizeLimit(Int32.MaxValue)]
        public async Task<dynamic> UploadObject([FromForm] UploadFile input)
        {
            // save file on the server first

            var fileSavePath = Path.Combine(_env.WebRootPath, Path.GetFileName(input.fileToUpload.FileName));

            using (var stream = new FileStream(fileSavePath, FileMode.Create))
                await input.fileToUpload.CopyToAsync(stream);

            long fileSize = (new FileInfo(fileSavePath)).Length;
         
            // get the bucket...
            dynamic oauth = await OAuthController.GetInternalAsync();
            ObjectsApi objectsAPI = new ObjectsApi();

            objectsAPI.Configuration.AccessToken = oauth.access_token;
            dynamic uploadedObj = null;

            // decide if upload direct or resumable (by chunks)
            if (fileSize > UPLOAD_CHUNK_SIZE * 1024 * 1024)
            {
                long chunkSize = 2 * 1024 * 1024;
                long numberOfChunks = (long)Math.Round((double)(fileSize / chunkSize)) + 1;

                long start = 0;
                chunkSize = (numberOfChunks > 1 ? chunkSize : fileSize);
                long end = chunkSize;
                string sessionId = Guid.NewGuid().ToString();


                // upload one chunk at a time
                using (BinaryReader reader = new BinaryReader(new FileStream(fileSavePath, FileMode.Open)))
                {
                    for (int chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++)
                    {
                        string range = string.Format("bytes {0}-{1}/{2}", start, end, fileSize);

                        long numberOfBytes = chunkSize + 1;
                        byte[] fileBytes = new byte[numberOfBytes];
                        MemoryStream memoryStream = new MemoryStream(fileBytes);
                        reader.BaseStream.Seek((int)start, SeekOrigin.Begin);
                        int count = reader.Read(fileBytes, 0, (int)numberOfBytes);
                        memoryStream.Write(fileBytes, 0, (int)numberOfBytes);
                        memoryStream.Position = 0;

                        uploadedObj = await objectsAPI.UploadChunkAsync(input.bucketKey, Path.GetFileName(input.fileToUpload.FileName),
                            (int)numberOfBytes, range, sessionId, memoryStream);

                        start = end + 1;
                        chunkSize = ((start + chunkSize > fileSize) ? fileSize - start - 1 : chunkSize);
                        end = start + chunkSize;
                    }
                }

            }
            else  // upload in a single call
            {
                using (StreamReader streamReader = new StreamReader(fileSavePath))
                {
                    uploadedObj = await objectsAPI.UploadObjectAsync(input.bucketKey, Path.GetFileName(input.fileToUpload.FileName),
                        (int)streamReader.BaseStream.Length, streamReader.BaseStream, "application/octet-stream");
                }
            }

            // cleanup
            System.IO.File.Delete(fileSavePath);

            return uploadedObj;
        }

        /// <summary>
        /// Delete a bucket by id
        /// </summary>
        [HttpDelete]
        [Route("api/forge/oss/buckets")]
        public async Task<IActionResult> DeleteBucketAsync([FromBody] BucketModel bucket)
        {
            BucketsApi buckets = new BucketsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            buckets.Configuration.AccessToken = token.access_token;
            await buckets.DeleteBucketAsync(bucket.bucketKey);
            return Ok();
        }

        // delete object from bucket
        [HttpDelete]
        [Route("api/forge/oss/objects")]
        public async Task<IActionResult> DeleteObjectAsync([FromBody] ObjectModel objectModel)
        {
            ObjectsApi objects = new ObjectsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            objects.Configuration.AccessToken = token.access_token;
            string objectName = Base64.Base64Decode(objectModel.objectName).Split("/")[1];
            await objects.DeleteObjectAsync(objectModel.bucketKey, System.Web.HttpUtility.UrlDecode(objectName));
            return Ok();
        }


        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
