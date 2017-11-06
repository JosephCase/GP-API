export default {
        reqTimeout: 600000,
        port: 8081,
        contentDirectory: "content/",
        imageSizes: [500, 700, 1000, 1400],
        videoFormats: [{"ext": "mp4", "codec": "libx264"}, {"ext": "webm", "codec": "libvpx"}],
        databaseLogin: {
                "host": "34.252.68.113",
                "port": "3306",
                "user": "",
                "password": "",
                "database": "giusy_test",
                "multipleStatements": true
        },
        login: {
                "username": "",
                "password": ""
        },
        contentTypes: {
                TEXT: 'text',
                IMAGE: 'image',
                VIDEO: 'video'
        },
        actionTypes: {
                CREATE: 'create',
                UPDATE: 'update',
                DELETE: 'delete'
        },
        jwtSecret: ''
}