/*!
 * mypype-fs
 * Copyright(c) 2016-forever
 * 'Do what the fork you want' Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

exports = module.exports = function(channelsRootPath){

  function fs_getChannelDirectories() {
    var directoryContent = fs.readdirSync(channelsRootPath);
    var directories = directoryContent.filter(function(filename) { 
      var filepath = path.join(channelsRootPath, filename);
      var stats = fs.statSync(filepath);
      return stats.isDirectory();
    });

    return directories; 
  }

  function fs_getVideoFilesInDirectory(channelDirectory) {
    var directoryContent = fs.readdirSync(channelDirectory);
    var videoFiles = directoryContent.filter(function(filename) { 
      var filepath = path.join(channelDirectory, filename);
      var stats = fs.statSync(filepath);
      return stats.isFile() && path.extname(filename) === ".mp4";
    });

    return videoFiles; 
  }

  function getChannelList() {
    var channels = [];
    
    var channelDirectories = fs_getChannelDirectories();
    for (var i = 0; i < channelDirectories.length; i++) {
      var channelName = channelDirectories[i];
      var id = crypto.createHash('md5').update(channelName).digest('hex');
      var pathServer = channelsRootPath + '/' + channelName;
      channels.push({ 
                      'id': id,
                      'name': channelName, 
                      'icon': "", 
                      'newVideosCount': 10
                    });
    }

    return channels;
  }

  function findChannelById(channelId) {
    console.log(findChannelById);
    var channelList = getChannelList();
    for (var i = 0; i < channelList.length; i++) {
      console.log(channelList[i].id, channelId)
      if(channelList[i].id === channelId)
        return channelList[i];
    }
  }
  function getChannelDirectory(channel) {
    var channelDirectory = path.join(channelsRootPath, channel.name);
    return channelDirectory;
  }
  function getChannelPublicDirectory(channel) {
    var channelDirectory = getChannelDirectory(channel);
    //console.log("public", channelPublicDirectory, path.relative("public", channelPublicDirectory));
    var channelPublicDirectory = path.relative("public/", channelDirectory);
    return channelPublicDirectory;
  }

  function parseVideoFileName(videoFileName) {
    var split1 = videoFileName.split("- ");
    var dateString = split1[0];
    split1[0] = "";
    videoFileName = split1.join('');

    var split2 = videoFileName.split(" -");
    var youtubeCode = split2[split2.length - 1];
    split2[split2.length - 1] = "";
    var name = split2.join('');

    var date = parseFileDate(dateString);
    return {
      'name': name,
      'date': date,
      'youtubeCode': youtubeCode
    }
  }
  function parseFileDate(dateString) {
    if(dateString.startsWith("s"))
      dateString = dateString.slice(1);

    var year  = dateString.slice(0, 4);
    var month = dateString.slice(4, -2);
    var day   = dateString.slice(-2);

    return {
      'year': year,
      'month': month,
      'day': day
    }
  }

  function getChannelInfo(channelId) {
    var videos = [];

    var channel = findChannelById(channelId);
    var channelDirectory = getChannelDirectory(channel);
    var channelPublicDirectory = getChannelPublicDirectory(channel);
    var videoFiles = fs_getVideoFilesInDirectory(channelDirectory);

    for (var i = 0; i < videoFiles.length; i++) {
      var videoFilename = videoFiles[i];
      var videoFilenameExtension = path.extname(videoFilename);
      var videoFilebasename = path.basename(videoFilename, videoFilenameExtension);
      var thumbnailFilename = videoFilebasename + ".jpg";
      var id = crypto.createHash('md5').update(videoFilename).digest('hex');

      var videoFilenameInfo = parseVideoFileName(videoFilebasename);

      videos.push({ 
                      'id': id,
                      'file': videoFilename, 
                      'icon': thumbnailFilename,
                      'name': videoFilenameInfo.name,
                      'date': videoFilenameInfo.date,
                      'youtubeCode': videoFilenameInfo.youtubeCode,
                    });
    }

    var channelInfo = {
      'channelId': channel.id,
      'channelName': channel.name,
      'channelDirectory': channelPublicDirectory,
      'videos': videos
    }

    return channelInfo;
  }



  return {
    'path': path,
    'getChannelList': getChannelList,
    'getChannelInfo': getChannelInfo
  }
};

