const express = require("express");
const { Router } = express;
const router = Router();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const cloudinary = require("cloudinary")

require("dotenv").config();
cloudinary.config({ 
  cloud_name: process.env.cnname, 
  api_key: process.env.cnkey, 
  api_secret: process.env.cnskey,
  secure: true
});
const apibbKey = process.env.apibbKey;

const UploadFolder = "src/raw";

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, UploadFolder);
  },
  filename: function(req, file, callback) {
    const ext = file.mimetype.split("/")[1];
    callback(null, `${req.query.name}.${ext}`);
  }
});

const upload = multer({
  storage: storage
});

const axiosRequest = async config => {
  return await axios(config).then(function(response) {
    return response.data;
  });
};
const postDataForm = async (url, params, data) => {
  return await axiosRequest({
    method: "post",
    url: url,
    params: params,
    headers: {
      ...data.getHeaders()
    },
    data: data
  });
};
const createFormData = async image => {
  var form = new FormData();
  form.append("image", await fs.createReadStream("src/raw/" + image));
  return form;
};

const removeFile = image => {
  fs.unlinkSync(image);
};

const formatImgbbData = data => {
  return {
    small: data.thumb.url,
    medium: data.medium.url,
    original: data.image.url
  };
};
router.post("/save", upload.single("file"), async (req, res, next) => {
  console.log("Image Save");
  try {
    if (!req.file) {
      return res.send({
        success: false
      });
    } else {
      var form = await createFormData("/" + req.file.filename);
      var url = `https://api.imgbb.com/1/upload`;
      var data = await postDataForm(
        url,
        {
          key: apibbKey
        },
        form
      );
      removeFile(UploadFolder + "/" + req.file.filename);
      var cdata = {};
      await cloudinary.v2.uploader.upload(
        data.data.image.url,
        function(error, result) {
          cdata= result;
          console.log(error);
        }
      );
      res.status(200).json({ imgbb: formatImgbbData(data.data), cn:{original:cdata.secure_url} });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      err: err,
      msg: "Server error"
    });
  }
});

module.exports = router;
