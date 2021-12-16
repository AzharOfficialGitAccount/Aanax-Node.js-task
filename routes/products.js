const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

// =================================== GET routes for Products===============================//

router.get(`/products`, async (req, res) => {

    const productList = await Product.find();

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

// =================================== POST routes For Products===============================//

router.post(`/products`, uploadOptions.single('images'), async (req, res) => {
    try {
        req.checkBody("title", "title can not be blank").notEmpty();
        req.checkBody("description", "description can not be blank").notEmpty();
        req.checkBody("images", "images can not be blank").notEmpty();
        req.checkBody("purchasePrice", "purchasePrice can not be blank").notEmpty();
        req.checkBody("sellingPrice", "sellingPrice can not be blank").notEmpty();

        const errors = req.validationErrors();
        if (errors) {
            let error = errors[0].msg;
            console.log("Field is missing", error);
        }
        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');

        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        let product = new Product({
            title: req.body.title,
            description: req.body.description,
            images: `${basePath}${fileName}`,
            purchasePrice: req.body.purchasePrice,
            sellingPrice: req.body.sellingPrice,
        });

        product = await product.save();

        if (!product) return res.status(500).send('The product cannot be created');

        res.send(product);
    } catch (error) {
        console.log("Error is=========>", error);
        return res.status(
            res,
            500,
            "Internal server error"
        );
    }
});


module.exports = router;

// ===================================END===============================//

// https://go.postman.co/workspace/My-Workspace~36ff75d9-9423-4014-87b9-d6558c907d46/collection/14829910-c1b8e387-0c53-44da-b3ca-6e716b7189ab