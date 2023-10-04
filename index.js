import http from 'http';
import axios from 'axios';
import { Resend } from 'resend';
import cronJob from 'node-cron'
import dbConnection from './sqllite.js';

const resend = new Resend('re_4QCH2E8B_ELiNTXefjmMnYks95YrfFYo3');

const getAnnouncements = async () => {
    const { data } = await axios.post(
        'https://udla.cl.api.mooestroviva.com/moofwd-rt/gateway.sjson',
        'json=%7B%22params%22%3A%7B%22roleId%22%3A%22student%22,%22numMax%22%3A%2220%22,%22userNC%22%3A%22201215013%22,%22lang%22%3A%22es%22,%22userId%22%3A%22201215013%22,%22period%22%3A%22202320%22,%22deviceId%22%3A%22CDCD66DC-CB10-4BD0-9428-1670993D6E01%22,%22os_version%22%3A%2217.0.2%22,%22model%22%3A%22iPhone%22,%22cryptedUserId%22%3A%22oIs0SWTKhrhI3ZEeWJDUUA%3D%3D%22,%22userToken%22%3A%2244450%5B-M003estr%40-%5D201215013%5B-M003estr%40-%5Dxxx%5B-M003estr%40-%5D13%22%7D,%22clientVersion%22%3A%221.0%22,%22service%22%3A%22annGetListByUserClientV2%22,%22methodName%22%3A%22invoke%22,%22appId%22%3A%221367146543839149%22,%22token%22%3A%22D2FF111F3373C1EC26A7BF1C3F64209F55001B069F556ABA0BCF2150177314BE62672001E7FD2DB5388E213CCD2FF3F20DBC45EEB939E8A76DF7BAA78E267CCABB480E8D5A27561B0B2A04D9C92AA244%22,%22clientID%22%3A%226%22%7D&clientID=6&clientVersion=1.0',
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }
    );
    const { annListResponse } = data.response;
    if (annListResponse.status === "OK") {
        const { annList } = annListResponse;
        const mappedAnnList = annList.map((ann) => {
            return {
                id: ann.id,
                title: ann.title,
                courseName: ann.course_name,
                description: ann.description,
                date: ann.dateDeploy,
            }
        });
        const SQLConn = await dbConnection();
        SQLConn.all('SELECT * FROM announcements', (err, rows) => {
            if (err) console.log(err);
            console.log(`Notificaciones totales: ${rows.length}`)
            for (const ann of mappedAnnList) {
                const isMatch = rows.some(el => el.id.toString() === ann.id.toString());
                if (!isMatch) {
                    console.log("Agregado: ", ann.id)
                    SQLConn.run(`INSERT INTO announcements (id, title, courseName, description, date) VALUES (?, ?, ?, ?, ?)`, [ann.id, ann.title, ann.courseName, ann.description, ann.date], (err) => {
                        if (err) console.log(err);
                    });
                    resend.emails.send({
                        from: 'onboarding@resend.dev',
                        to: 'sh4c0p@gmail.com',
                        subject: 'Nueva Notificacion de UDLA 🎉',
                        html: `
                            <h1>Notificaciones UDLA</h1>
                            <h2>${ann.title}</h2>
                            <div>${ann.description}</div>
                            `
                    });
                }
            }
        })
    }
}




http.createServer(function (req, res) {
    if (req.url === '/cron') {
        console.log("Running Cron Job")
        console.log(new Date().toLocaleString())
        getAnnouncements();
    }
    res.end();
}).listen(process.env.PORT || 3000);

