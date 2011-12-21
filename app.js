var app = require('http').createServer(handler)
	,io = require('socket.io').listen(app)
	,fs = require('fs');

app.listen('3000');

function handler(req, res){
	fs.readFile(__dirname+'/index.html',
		function(err,data){
			if(err){
				res.writeHead(500);
				return res.end('Error Loading index.html');
			}
			res.setHeader('Content-Type','text/html');
			res.writeHead(200);
			res.end(data);
		});
}

var nicknames = {};

// 전체 소켓덜로 처리 
io.sockets.on('connection', function(socket){
	// 사용자 채팅 메시지 (public)
	socket.on('user message',function(msg){
		socket.broadcast.emit('user message',socket.nickname,msg);
	});
	
	// 사용자 접속시 Nickname 처리 public 
	socket.on('nickname', function(nick, fn){
		if (nicknames[nick]){
			fn(true);
		}else {
			fn(false);
			nicknames[nick] = socket.nickname = nick;
			socket.broadcast.emit('announcement', nick + '님 들어오셨습니다.');
			socket.broadcast.emit('nicknames', nicknames);
			socket.emit('nicknames', nicknames);
		}
	});

	socket.on('disconnect', function(){
		if (!socket.nickname) return;

		delete nicknames[socket.nickname];
		socket.broadcast.emit('announcement', socket.nickname + '님 나가셨습니다.');
		socket.broadcast.emit('nicknames', nicknames);
	});
});
