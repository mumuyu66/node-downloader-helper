'use strict';Object.defineProperty(exports,'__esModule',{value:!0}),exports.DownloaderHelper=exports.DH_STATES=void 0;var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a},_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_events=require('events'),_fs=require('fs'),fs=_interopRequireWildcard(_fs),_path=require('path'),path=_interopRequireWildcard(_path),_http=require('http'),http=_interopRequireWildcard(_http),_https=require('https'),https=_interopRequireWildcard(_https),_url=require('url'),URL=_interopRequireWildcard(_url);function _interopRequireWildcard(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function _inherits(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}var DH_STATES=exports.DH_STATES={IDLE:'IDLE',SKIPPED:'SKIPPED',STARTED:'STARTED',DOWNLOADING:'DOWNLOADING',RETRY:'RETRY',PAUSED:'PAUSED',RESUMED:'RESUMED',STOPPED:'STOPPED',FINISHED:'FINISHED',FAILED:'FAILED'},DownloaderHelper=exports.DownloaderHelper=function(a){function b(a,c){var d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};_classCallCheck(this,b);var e=_possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).call(this));return e.__validate(a,c)?(e.url=e.requestURL=a,e.state=DH_STATES.IDLE,e.__defaultOpts={retry:!1,method:'GET',headers:{},fileName:'',override:!1,forceResume:!1,removeOnStop:!0,removeOnFail:!0,httpRequestOptions:{},httpsRequestOptions:{}},e.__opts=Object.assign({},e.__defaultOpts),e.__pipes=[],e.__total=0,e.__downloaded=0,e.__progress=0,e.__retryCount=0,e.__states=DH_STATES,e.__promise=null,e.__request=null,e.__response=null,e.__isResumed=!1,e.__isResumable=!1,e.__isRedirected=!1,e.__destFolder=c,e.__statsEstimate={time:0,bytes:0,prevBytes:0},e.__fileName='',e.__filePath='',e.updateOptions(d),e):_possibleConstructorReturn(e)}return _inherits(b,a),_createClass(b,[{key:'start',value:function b(){var a=this;return new Promise(function(b,c){a.__isRedirected||a.state===a.__states.RESUMED||(a.emit('start'),a.__setState(a.__states.STARTED)),a.__response=null,a.__promise={resolve:b,reject:c},a.__request=a.__downloadRequest(b,c),a.__request.on('error',a.__onError(b,c)),a.__request.on('timeout',function(){return a.emit('timeout')}),a.__request.end()})}},{key:'pause',value:function a(){return this.__request&&this.__request.abort(),this.__response&&(this.__response.unpipe(),this.__pipes.forEach(function(a){return a.stream.unpipe()})),this.__resolvePending(),this.__setState(this.__states.PAUSED),this.emit('pause'),Promise.resolve(!0)}},{key:'resume',value:function a(){return this.__setState(this.__states.RESUMED),this.__isResumable&&(this.__isResumed=!0,this.__options.headers.range='bytes='+this.__downloaded+'-'),this.emit('resume',this.__isResumed),this.start()}},{key:'stop',value:function d(){var a=this,b=function(){a.__resolvePending(),a.__setState(a.__states.STOPPED),a.emit('stop')},c=function(){return new Promise(function(c,d){fs.access(a.__filePath,function(e){return e?(b(),c(!0)):void fs.unlink(a.__filePath,function(e){return e?(a.__setState(a.__states.FAILED),a.emit('error',e),d(e)):void(b(),c(!0))})})})};return this.__request&&this.__request.abort(),this.__closeFileStream().then(function(){return a.__opts.removeOnStop?c():(b(),Promise.resolve(!0))})}},{key:'pipe',value:function c(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;return this.__pipes.push({stream:a,options:b}),a}},{key:'unpipe',value:function d(){var a=this,b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,c=function(b){return a.__response?a.__response.unpipe(b):b.unpipe()};if(b){var e=this.__pipes.find(function(a){return a.stream===b});return void(e&&(c(b),this.__pipes=this.__pipes.filter(function(a){return a.stream!==b})))}this.__pipes.forEach(function(a){return c(a.stream)}),this.__pipes=[]}},{key:'getDownloadPath',value:function a(){return this.__filePath}},{key:'isResumable',value:function a(){return this.__isResumable}},{key:'updateOptions',value:function b(a){this.__opts=Object.assign({},this.__opts,a),this.__headers=this.__opts.headers,this.__options=this.__getOptions(this.__opts.method,this.url,this.__opts.headers),this.__initProtocol(this.url)}},{key:'getStats',value:function a(){return{total:this.__total,name:this.__fileName,downloaded:this.__downloaded,progress:this.__progress,speed:this.__statsEstimate.bytes}}},{key:'getTotalSize',value:function c(){var a=this,b=this.__getOptions('HEAD',this.url,this.__headers);return new Promise(function(c,d){var e=a.__protocol.request(b,function(b){if(a.__isRequireRedirect(b)){var e=URL.resolve(a.url,b.headers.location),f=a.__getOptions('HEAD',e,a.__headers),g=a.__protocol.request(f,function(b){200!==b.statusCode&&d(new Error('Response status was '+b.statusCode)),c({name:a.__getFileNameFromHeaders(b.headers),total:parseInt(b.headers['content-length']||0)})});return void g.end()}200!==b.statusCode&&d(new Error('Response status was '+b.statusCode)),c({name:a.__getFileNameFromHeaders(b.headers),total:parseInt(b.headers['content-length']||0)})});e.end()})}},{key:'__resolvePending',value:function b(){if(this.__promise){var a=this.__promise.resolve;return this.__promise=null,a(!0)}}},{key:'__downloadRequest',value:function d(a,b){var c=this;return this.__protocol.request(this.__options,function(d){if(c.__response=d,c.__isResumed||(c.__total=parseInt(d.headers['content-length']),c.__resetStats()),c.__isRequireRedirect(d)){var e=URL.resolve(c.url,d.headers.location);return c.__isRedirected=!0,c.__initProtocol(e),c.start().then(function(){return a(!0)}).catch(function(a){return c.__setState(c.__states.FAILED),c.emit('error',a),b(a)})}if(200!==d.statusCode&&206!==d.statusCode){var f=new Error('Response status was '+d.statusCode);return f.status=d.statusCode||0,f.body=d.body||'',c.__setState(c.__states.FAILED),c.emit('error',f),b(f)}c.__opts.forceResume?c.__isResumable=!0:d.headers.hasOwnProperty('accept-ranges')&&'none'!==d.headers['accept-ranges']&&(c.__isResumable=!0),c.__startDownload(d,a,b)})}},{key:'__startDownload',value:function f(a,b,c){var d=this,e=a;if(!this.__isResumed){var g=this.__getFileNameFromHeaders(a.headers);if(this.__filePath=this.__getFilePath(g),this.__fileName=this.__filePath.split(path.sep).pop(),fs.existsSync(this.__filePath)){var h=this.__getFilesizeInBytes(this.__filePath);if('object'===_typeof(this.__opts.override)&&this.__opts.override.skip&&(this.__opts.override.skipSmaller||h>=this.__total))return this.emit('skip',{totalSize:this.__total,fileName:this.__fileName,filePath:this.__filePath,downloadedSize:h}),this.__setState(this.__states.SKIPPED),b(!0)}this.__fileStream=fs.createWriteStream(this.__filePath,{})}else this.__fileStream=fs.createWriteStream(this.__filePath,{flags:'a'});this.emit('download',{fileName:this.__fileName,filePath:this.__filePath,totalSize:this.__total,isResumed:this.__isResumed,downloadedSize:this.__downloaded}),this.__isResumed=!1,this.__isRedirected=!1,this.__setState(this.__states.DOWNLOADING),this.__statsEstimate.time=new Date,e.on('data',function(a){return d.__calculateStats(a.length)}),this.__pipes.forEach(function(a){e.pipe(a.stream,a.options),e=a.stream}),e.pipe(this.__fileStream),e.on('error',this.__onError(b,c)),this.__fileStream.on('finish',this.__onFinished(b,c)),this.__fileStream.on('error',this.__onError(b,c))}},{key:'__hasFinished',value:function a(){return this.state!==this.__states.PAUSED&&this.state!==this.__states.STOPPED&&this.state!==this.__states.FAILED}},{key:'__isRequireRedirect',value:function b(a){return 300<a.statusCode&&400>a.statusCode&&a.headers.hasOwnProperty('location')&&a.headers.location}},{key:'__onFinished',value:function d(a,b){var c=this;return function(){c.__fileStream.close(function(d){return d?b(d):(c.__hasFinished()&&(c.__setState(c.__states.FINISHED),c.__pipes=[],c.emit('end',{fileName:c.__fileName,filePath:c.__filePath,totalSize:c.__total,incomplete:c.__downloaded!==c.__total,onDiskSize:c.__getFilesizeInBytes(c.__filePath),downloadedSize:c.__downloaded})),a(!0))})}}},{key:'__closeFileStream',value:function b(){var a=this;return this.__fileStream?new Promise(function(b,c){a.__fileStream.close(function(a){return a?c(a):b(!0)})}):Promise.resolve(!0)}},{key:'__onError',value:function e(a,b){var c=this,d=function(){return new Promise(function(a){return c.__fileStream?void c.__fileStream.close(function(){return c.__opts.removeOnFail?fs.unlink(c.__filePath,function(){return a()}):void a()}):a()})};return function(e){return c.__pipes=[],c.__setState(c.__states.FAILED),c.emit('error',e),c.__opts.retry?c.__retry().then(function(){return a(!0)}).catch(function(a){return d().then(function(){return b(a?a:e)})}):d().then(function(){return b(e)})}}},{key:'__retry',value:function b(){var a=this;if(!this.__opts.retry)return Promise.reject();if('object'!==_typeof(this.__opts.retry)||!this.__opts.retry.hasOwnProperty('maxRetries')||!this.__opts.retry.hasOwnProperty('delay')){var c=new Error('wrong retry options');return this.__setState(this.__states.FAILED),this.emit('error',c),Promise.reject(c)}return this.__retryCount>=this.__opts.retry.maxRetries?Promise.reject():(this.__retryCount++,this.__setState(this.__states.RETRY),this.emit('retry',this.__retryCount,this.__opts.retry),new Promise(function(b){return setTimeout(function(){return b(0<a.__downloaded?a.resume():a.start())},a.__opts.retry.delay)}))}},{key:'__resetStats',value:function a(){this.__retryCount=0,this.__downloaded=0,this.__progress=0,this.__statsEstimate={time:0,bytes:0,prevBytes:0}}},{key:'__getFileNameFromHeaders',value:function c(a){var b='';return a.hasOwnProperty('content-disposition')&&-1<a['content-disposition'].indexOf('filename=')?(b=a['content-disposition'],b=b.trim(),b=b.substr(b.indexOf('filename=')+9),b=b.replace(/"/g,'')):b=path.basename(URL.parse(this.requestURL).pathname),this.__opts.fileName?this.__getFileNameFromOpts(b):b}},{key:'__getFilePath',value:function d(a){var b=path.join(this.__destFolder,a),c=b;return this.__opts.override||this.state===this.__states.RESUMED||(c=this.__uniqFileNameSync(c),b!==c&&this.emit('renamed',{path:c,fileName:c.split(path.sep).pop(),prevPath:b,prevFileName:b.split(path.sep).pop()})),c}},{key:'__getFileNameFromOpts',value:function f(a){if(!this.__opts.fileName)return a;if('string'==typeof this.__opts.fileName)return this.__opts.fileName;if('function'==typeof this.__opts.fileName){var g=path.join(this.__destFolder,a);return this.__opts.fileName(a,g)}if('object'===_typeof(this.__opts.fileName)){var b=this.__opts.fileName,c=b.name,d=!!b.hasOwnProperty('ext')&&b.ext;if('string'==typeof d)return c+'.'+d;if('boolean'==typeof d){if(d)return c;var e=a.split('.').pop();return c+'.'+e}}return a}},{key:'__calculateStats',value:function d(a){var b=new Date,c=b-this.__statsEstimate.time;a&&(this.__downloaded+=a,this.__progress=100*(this.__downloaded/this.__total),(this.__downloaded===this.__total||1e3<c)&&(this.__statsEstimate.time=b,this.__statsEstimate.bytes=this.__downloaded-this.__statsEstimate.prevBytes,this.__statsEstimate.prevBytes=this.__downloaded,this.emit('progress.throttled',this.getStats())),this.emit('progress',this.getStats()))}},{key:'__setState',value:function b(a){this.state=a,this.emit('stateChanged',this.state)}},{key:'__getOptions',value:function f(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{},d=URL.parse(b),e={protocol:d.protocol,host:d.hostname,port:d.port,path:d.path,method:a};return c&&(e.headers=c),e}},{key:'__getFilesizeInBytes',value:function d(a){var b=fs.statSync(a),c=b.size;return c}},{key:'__validate',value:function d(a,b){if('string'!=typeof a)throw new Error('URL should be an string');if(!a)throw new Error('URL couldn\'t be empty');if('string'!=typeof b)throw new Error('Destination Folder should be an string');if(!b)throw new Error('Destination Folder couldn\'t be empty');if(!fs.existsSync(b))throw new Error('Destination Folder must exist');var c=fs.statSync(b);if(!c.isDirectory())throw new Error('Destination Folder must be a directory');try{fs.accessSync(b,fs.constants.W_OK)}catch(a){throw new Error('Destination Folder must be writable')}return!0}},{key:'__initProtocol',value:function c(a){var b=this.__getOptions(this.__opts.method,a,this.__headers);this.requestURL=a,-1<a.indexOf('https://')?(this.__protocol=https,this.__options=Object.assign({},b,this.__opts.httpsRequestOptions)):(this.__protocol=http,this.__options=Object.assign({},b,this.__opts.httpRequestOptions))}},{key:'__uniqFileNameSync',value:function f(a){if('string'!=typeof a||''===a)return a;try{fs.accessSync(a,fs.F_OK);var b=a.match(/(.*)(\([0-9]+\))(\..*)$/),c=b?b[1].trim():a,d=b?parseInt(b[2].replace(/\(|\)/,'')):0,e=a.split('.').pop();return e===a?e='':(e='.'+e,c=c.replace(e,'')),this.__uniqFileNameSync(c+' ('+ ++d+')'+e)}catch(b){return a}}}]),b}(_events.EventEmitter);
