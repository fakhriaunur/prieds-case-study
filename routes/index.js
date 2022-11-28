var express = require('express');
var router = express.Router();
const stock_read_log = require('../models/stock_read_log');
const FileSystem = require("fs");

router.use('/export-data', async (req, res) => {
  const list = await stock_read_log.aggregate([
    {
      $match: {}
    }
  ]).exec();
  
  FileSystem.writeFile('./stock_read_log.json', JSON.stringify(list), (error) => {
      if (error) throw error;
  });

  console.log('stock_read_log.json exported!');
  res.json({statusCode: 1, message: 'stock_read_log.json exported!'})
});

router.use('/import-data', async (req, res) => {
  const list = await stock_read_log.aggregate([
    {
      $match: {}
    }
  ]).exec();
  
  FileSystem.readFile('./stock_read_log.json', async (error, data) => {
      if (error) throw error;

      const list = JSON.parse(data);

      const deletedAll = await stock_read_log.deleteMany({});

      const insertedAll = await stock_read_log.insertMany(list);

      console.log('stock_read_log.json imported!');
  res.json({statusCode: 1, message: 'stock_read_log.json imported!'})
  });

  
})

router.use('/edit-repacking-data', async (req, res) => {
  
  // Silahkan dikerjakan disini.

  // Create post data request object
  const postData = await req.body;

  // Create an array to store the new qr documents
  const qrNewList = []

  // create a loop to iterate thru the new_qr_list array
  for (let i = 0; i < postData.new_qr_list.length; i++) {
    let temp = await stock_read_log.findOneAndUpdate(
      {
        // "qr_list.payload": postData.reject_qr_list[i].payload
        qr_list: {
          $elemMatch: {
            payload: postData.new_qr_list[i].payload
          }
        }
      },
      {
        $pull: {
          qr_list: {
            payload: postData.new_qr_list[i].payload
          }
        },
        $inc: {
          qty: -1
        }
      }
    ).exec();

    // filter the exact qr payloads
    let pushItem = temp.qr_list.find(
      e => e.payload == postData.new_qr_list[i].payload
    );
    
    // push the exact qr payloads to the list
    qrNewList.push(pushItem);
  }

  // res.send(qrNewList);

  // Create an array to store the rejected qr documents
  const qrRejectedList = []
  
  // Create a loop to iterate thru the reject_qr_list array
  for (let i = 0; i < postData.reject_qr_list.length; i++) {
    await stock_read_log.updateOne(
      {
        qr_list: {
          $elemMatch: {
            payload: postData.reject_qr_list[i].payload
          }
        }
      },
      {
        $set: {
          "qr_list.$.status": 0,
          "qr_list.$.status_qc": 1
        },
      }
    ).exec();

    let temp = await stock_read_log.findOneAndUpdate(
      {
        qr_list: {
          $elemMatch: {
            payload: postData.reject_qr_list[i].payload
          }
        }
      },
      {
        $pull: {
          qr_list: {
            payload: postData.reject_qr_list[i].payload
          }
        },
        $inc: {
          qty: -1
        }
      }
    ).exec();

    // filter the exact payload
    let pushItem = await temp.qr_list.find(
      e => e.payload == postData.reject_qr_list[i].payload
    );

    // push the exact payload to the list
    qrRejectedList.push(pushItem);
  }

  // res.send(qrRejectedList);

  // insert qrNewList element to the new payload
  // Create a loop to iterate the qrNewList
  for (let i = 0; i < qrNewList.length; i++) {
    await stock_read_log.updateOne(
      {
        payload: postData.payload
      },
      {
        $push: {
          qr_list: qrNewList[i]
        },
        $inc: {
          qty: 1
        }
      }
    ).exec();
  }

  const finalData = await stock_read_log.find({})

  console.log('data repacking completed!');

  const list = await stock_read_log.aggregate([
    {
      $match: {}
    }
  ]).exec();
  
  FileSystem.writeFile('./repacked_stock_read_log.json', JSON.stringify(list), (error) => {
      if (error) throw error;
  });
  console.log('repacked_stock_read_log.json created!');
  // res.send(finalData);
  res.json({statusCode: 1, message: 'data repacking completed!'});

})

router.use('/', function(req, res, next) {
  res.render('index', { title: 'Implemented Case Study' });
});

module.exports = router;
