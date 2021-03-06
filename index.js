"use strict";
exports.__esModule = true;
var mysql = require("mysql");
var fastify = require("fastify");
var cors = require("fastify-cors");
var pointOfView = require("point-of-view");
var connection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Vmware1!',
    database: 'its_kennedy'
});
var app = fastify({
    logger: true,
    ignoreTrailingSlash: true
});
app.register(cors);
app.register(pointOfView, {
    engine: {
        ejs: require('ejs')
    }
});
// ------------------ Studenti
// studente by id Sede
app.get('/api/sede/students/:id', function (request, reply) {
    connection.query("select u.nome,u.cognome,c.corso from utente as u inner join CORSO as c on u.CORSO_idCORSO=c.idCORSO inner join  sede as s on c.SEDE_idSEDE=s.idSEDE where c.SEDE_idSEDE=? order by u.nome asc ", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// studenti in base al corso
app.get('/api/sede/students/:id/corso/:corso', function (request, reply) {
    connection.query("select concat('Il sottoscritto',' ',u.nome,' ',u.cognome) as 'NomeCompleto' ,concat('nato a',' ',u.luogo_nascita,' ','il',' ',u.data_nascita) as anagrafica , concat('e residente a',' ',u.comune,'(', u.provincia_sigla,')',',',u.via,',','n°',u.civico) as indirizzo from utente as u inner join corso as c on u.CORSO_idCORSO=c.idCORSO where  c.SEDE_idSEDE=? and c.corso=? ", [request.params.id, request.params.corso], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.view('/studenti.ejs', {
            dati: results,
            title: "Elenco Studenti"
        });
    });
});
// studente in base al nome 
app.get('/api/sede/students/:id/nome/:nome', function (request, reply) {
    connection.query("select u.nome,u.cognome,u.data_nascita,u.luogo_nascita,u.via,u.civico,u.comune,u.provincia_sigla,u.frequentazione,c.corso,s.SEDE from utente as u inner join CORSO as c on u.CORSO_idCORSO=c.idCORSO  inner join sede as s on c.SEDE_idSEDE=s.idSEDE where c.SEDE_idSEDE=? AND  nome=? ", [request.params.id, request.params.nome], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// dettagli studente per id studente
app.get('/api/sede/students/:id/details/:idu', function (request, reply) {
    connection.query("select utente.nome,utente.cognome,utente.data_nascita,utente.luogo_nascita,utente.via,utente.civico,utente.comune,utente.provincia_sigla,utente.frequentazione,corso.CORSO,sede.SEDE from utente inner join corso on utente.CORSO_idCORSO=corso.idCORSO  inner join sede on corso.SEDE_idSEDE=sede.idSEDE where corso.SEDE_idSEDE=? AND utente.idUTENTE=?  ", [request.params.id, request.params.idu], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// insert new studente
app.post('/api/students/newStudents', function (request, reply) {
    var u = request.body;
    var date = new Date(u.data_nascita);
    connection.query("insert into utente (nome,cognome,data_nascita,luogo_nascita,via,civico,comune,provincia_sigla,frequentazione,CORSO_idCORSO) values(?,?,?,?,?,?,?,?,?,?)", [u.nome, u.cognome, date, u.luogo_nascita, u.via, u.civico, u.comune, u.provincia, u.CORSO_idCORSO, u.frequentazione], function (error, results, fields) {
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.status(204).send(results);
    });
});
// -----------------------Computer
//dato il pc e la sede  fa vedere tutti i movimenti 
app.get('/api/sede/:id/cronologia/:pc', function (request, reply) {
    connection.query("select PC.idpc,PC.Seriale,m.UTENTE_idUTENTE,m.idMOVIMENTO,m.data_consegna,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento from PC inner join movimento as m on PC.idpc=m.PC_idpc inner join pc_has_sede as p on PC.idpc=p.PC_idpc where p.SEDE_idSEDE=? AND PC.Seriale=?", [request.params.id, request.params.pc], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// fa vedere tutti i pc data la sede
app.get('/api/sede/pc/:id', function (request, reply) {
    connection.query("select p.Seriale, h.Cpu,h.Ram,h.Memoria,h.Tipo_memoria,h.marca,h.modello,p.n_inventario,p.n_fattura,p.data_Acquisto,s.guasto,p.note,s.KO from pc as p inner join hw as h on p.HW_idHW=h.idHW inner join pc_has_sede on p.idpc=pc_has_sede.PC_idpc inner join sede on pc_has_sede.SEDE_idSEDE=sede.idSEDE inner join STATO as s on pc.STATO_idSTATO=s.idSTATO where sede.idSEDE=? ", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.view('/serialelista.ejs', {
            dati: results,
            title: "Elenco Seriali "
        });
    });
});
// insert di pc 
app.post('/api/sede/pc', function (request, reply) {
    var pc = request.body;
    connection.query("INSERT INTO pc (HW_idHW,Seriale,n_inventario,n_fattura,data_Acquisto,note,SEDE_idSEDE) values(?,?,?,?,?,?,?) ", [pc.HW_idHW, pc.Seriale, pc.n_inventario, pc.n_fattura, pc.data_Acquisto, pc.note, pc.SEDE_idSEDE], function (error, results, fields) {
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.status(201).send();
    });
});
// elenco movimenti
app.get('/api/sede/movimento/:id', function (request, reply) {
    connection.query("select distinct(m.data_consegna),m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,m.data_consegna,u.nome,u.cognome from movimento as m inner join  utente as u on m.UTENTE_idUTENTE=u.idUTENTE inner join pc on m.PC_idpc=pc.idpc inner join sede on pc.SEDE_idSEDE=sede.idSEDE where sede.idSEDE=?", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.view('/pc.ejs', {
            dati: results,
            title: "Elenco Movimenti "
        });
    });
});
app.get('/api/sede/movimenti/:id/:idstato', function (request, reply) {
    connection.query("select m.data_consegna,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,m.data_consegna,u.nome,u.cognome,pc.Seriale from movimento as m inner join  utente as u on m.UTENTE_idUTENTE=u.idUTENTE inner join pc on m.PC_idpc=pc.idpc inner join stato on pc.STATO_idSTATO=stato.idSTATO where pc.SEDE_idSEDE=? && stato.idSTATO=? ", [request.params.id, request.params.idstato], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// pc in base allo studente e alla sede
app.get('/api/sede/pc/:id/students/:idstu', function (request, reply) {
    connection.query("select u.nome,u.cognome,c.corso,pc.idpc,pc.HW_idHW,pc.note,m.data_consegna,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,s.idSTATO from utente as u inner join CORSO as c on u.CORSO_idCORSO=c.idCORSO inner join movimento as m on m.UTENTE_idUTENTE=u.idUTENTE inner join pc on m.PC_idpc=pc.idpc inner join STATO as s on pc.STATO_idSTATO=s.idSTATO inner join sede as se on c.SEDE_idSEDE=se.idSEDE where se.idSEDE=? AND u.idUTENTE=? order by m.data_consegna desc", [request.params.id, request.params.idstu], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// pc from sede id e stato id
app.get('/api/sede/pc/:id/stato/:idstato', function (request, reply) {
    connection.query("select pc.idpc,pc.HW_idHW,pc.STATO_idSTATO,pc.Seriale,pc.n_inventario,pc.n_fattura,pc.data_Acquisto,pc.note from pc inner join stato as c on pc.STATO_idSTATO=c.idStato inner join sede as s on pc.SEDE_idSEDE=s.idsede where s.idSEDE=? AND c.idstato=?", [request.params.id, request.params.idstato], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// pc e hw from sede e stato
app.get('/api/sede/pc/:id/stato/:idstato/hw', function (request, reply) {
    connection.query("SELECT pc.idpc,pc.HW_idHW,pc.STATO_idSTATO,pc.Seriale,pc.n_inventario,pc.n_fattura,pc.data_Acquisto,pc.note,h.idHW,h.Cpu,h.Ram,h.Memoria,h.marca,h.modello from pc inner join pc_has_sede as a on pc.idpc=a.pc_idpc inner join stato as c on pc.STATO_idSTATO=c.idStato inner join sede as s on a.sede_idsede=s.idsede inner join hw as h on pc.HW_idHW=h.idHW where s.idsede=? & c.idstato=?", [request.params.id, request.params.idstato], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// funziona ma...
app.get('/api/sede/pcwithstate/:id', function (request, reply) {
    connection.query("select pc.idpc,pc.HW_idHW,pc.STATO_idSTATO,pc.Seriale,pc.n_inventario,pc.n_fattura,pc.data_Acquisto,pc.note,m.idMOVIMENTO,m.data_consegna,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,m.PC_idpc,m.UTENTE_idUTENTE,m.ADMIN_idADMIN from pc inner join movimento as m on pc.idpc=m.PC_idpc inner join stato as s on pc.STATO_idSTATO=s.idSTATO inner join pc_has_sede  as o on pc.idpc=o.PC_idpc  where guasto=1 || ritiro=1 || consegna=1|| KO=1||riparazione=1 AND o.SEDE_idSEDE=?", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// --------Ultimi Ritiri
app.get('/api/sede/ritiri/:id', function (request, reply) {
    connection.query("select pc.Seriale,movimento.data,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,utente.nome,utente.cognome,c.corso  from movimento as m join (select MAX(data_consegna) as data from movimento group by PC_idpc ) movimento   on m.data_consegna=movimento.data inner join pc on m.PC_idpc=pc.idpc join utente on m.UTENTE_idUTENTE=utente.idUTENTE inner join CORSO as c on utente.CORSO_idCORSO=c.idCORSO   inner join sede as s on c.SEDE_idSEDE=s.idSEDE inner join STATO on pc.STATO_idSTATO=STATO.idSTATO where  s.idSEDE=? & STATO.ritiro=1 group by Seriale", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.view('/listaritiri.ejs', {
            dati: results,
            title: 'Elenco Ultimi Ritiri'
        });
    });
});
// cronologia movimenti in base all'admin
app.get('/api/sede/:id/movimenti/:admin', function (request, reply) {
    connection.query("select pc.Seriale,m.data_consegna,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,utente.nome,utente.cognome,c.corso from movimento as m inner join pc on m.PC_idpc=pc.idpc join utente on m.UTENTE_idUTENTE=utente.idUTENTE inner join CORSO as c on utente.CORSO_idCORSO=c.idCORSO   inner join sede as s on c.SEDE_idSEDE=s.idSEDE inner join STATO on pc.STATO_idSTATO=STATO.idSTATO where s.idSEDE=? AND m.ADMIN_idADMIN=?  order by   m.idMOVIMENTO desc ", [request.params.id, request.params.admin], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// insert movimenti
app.post('/api/sede/movimenti', function (request, reply) {
    connection.query("INSERT INTO MOVIMENTO (data_consegna,cavo_rete,alimentatore,borsa,mouse,hdd,con_ethernet,con_usb,note,note_movimento,PC_idPC,UTENTE_idUTENTE,ADMIN_idADMIN) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [request.body.data_consegna, request.body.cavo_rete, request.body.alimentatore, request.body.borsa, request.body.mouse, request.body.hdd, request.body.con_ethernet, request.body.con_usb, request.body.note, request.body.note_movimento, request.body.PC_idpc, request.body.UTENTE_idUTENTE, request.body.ADMIN_idADMIN], function (error, results, fields) {
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.status(201).send();
    });
});
//  -----------Ultime Consegne   
app.get('/api/sede/consegne/:id', function (request, reply) {
    connection.query("select pc.Seriale,movimento.data,m.cavo_rete,m.alimentatore,m.borsa,m.mouse,m.hdd,m.con_ethernet,m.con_usb,m.note,m.note_movimento,utente.nome,utente.cognome,c.corso  from movimento as m join (select MAX(data_consegna) as data from movimento group by PC_idpc ) movimento   on m.data_consegna=movimento.data inner join pc on m.PC_idpc=pc.idpc join utente on m.UTENTE_idUTENTE=utente.idUTENTE   inner join CORSO as c on utente.CORSO_idCORSO=c.idCORSO inner join sede as s on c.SEDE_idSEDE=s.idSEDE inner join STATO on pc.STATO_idSTATO=STATO.idSTATO where   s.idSEDE=? & STATO.consegna=1 group by Seriale", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.view('/listaconsegne.ejs', {
            dati: results,
            title: "Elenco Ultime Consegne "
        });
    });
});
// ---------Admin
// cerca tutti gli admin
app.get('/api/admin', function (request, reply) {
    connection.query("select a.Nome_Admin,a.Cognome_Admin,a.Username,a.Email,a.Password,a.RUOLO,a.Admin_Status,s.sede from admin as a inner join admin_has_sede on a.idADMIN=admin_has_sede.ADMIN_idADMIN inner join sede as s on admin_has_sede.SEDE_idSEDE=s.idSEDE order by Nome_Admin asc ", function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// cerca admin in base alla sede
app.get('/api/sede/admin/:id', function (request, reply) {
    connection.query("select a.Nome_Admin,a.Cognome_Admin,a.Username,a.Email,a.RUOLO,a.Admin_status,s.sede from admin as a inner join admin_has_sede on a.idADMIN=admin_has_sede.ADMIN_idADMIN inner join sede as s on admin_has_sede.SEDE_idSEDE=s.idSEDE where s.idSEDE=?", [request.params.id], function (error, results, fields) {
        app.log.info(results);
        app.log.info(fields);
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.send(results);
    });
});
// insert di Admin
app.post('/api/sede/admin', function (request, reply) {
    var admin = request.body;
    connection.query("INSERT INTO admin SET ?", admin, function (error, results, fields) {
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.status(201).send();
    });
});
// insert di nuovo hw
app.post('/api/sede/hw', function (request, reply) {
    connection.query("INSERT INTO HW (Cpu,Ram,Memoria,Tipo_Memoria,marca,Modello) VALUES(?,?,?,?,?,?)", [request.body.Cpu, request.body.Ram, request.body.Memoria, request.body.Tipo_memoria, request.body.marca, request.body.modello], function (error, results, fields) {
        if (error) {
            reply.status(500).send({ error: error.message });
            return;
        }
        reply.status(201).send();
    });
});
app.listen(3000, function (err, address) {
    if (err)
        throw err;
    app.log.info('server listening on' + address);
});
