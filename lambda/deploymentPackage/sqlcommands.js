class processMYSQL {

    constructor(params) {
        this.params = params;
        this.studentStatements = {
            requestTrade: "INSERT INTO trades (payment, trader_id, tradee_id, section_id) VALUES ({payment}, {trader_id}, {tradee_id}, {section_id});",
            acceptTrade: "UPDATE trades SET status = 'a' WHERE trade_id = {trade_id};",
            subtractMoneyFromTrader: "UPDATE section_students SET stu.student_funds = (SELECT stu.student_funds FROM section_students AS stu INNER JOIN trades AS tr ON stu.student_id = tr.trader_id WHERE tr.trade_id = {trade_id}) - (SELECT payment FROM trades WHERE trade_id = {trade_id});",
            addMoneyToTradee: "UPDATE section_students SET stu.student_funds = (SELECT stu.student_funds FROM section_students AS stu INNER JOIN trades AS tr ON stu.student_id = tr.tradee_id WHERE tr.trade_id = v) + (SELECT payment FROM trades WHERE trade_id = {trade_id});",
            giveArtToTraderFromTradee: "UPDATE art_pieces SET ap.owner_id = (SELECT tr.trader_id FROM trades as tr WHERE tr.trade_id = {trade_id}) WHERE ap.trade_id = {trade_id};",
            giveArtToTradeeFromTrader: "UPDATE art_pieces SET ap.owner_id = (SELECT tr.trader_id FROM trades as tr WHERE tr.trade_id = {trade_id}) WHERE ap.trade_id = {trade_id};",
            submitArtToProfessor: "INSERT INTO submissions (art_piece_id, submitted_artist, submitted_title, submitted_date, submitted_description, submitted_summary) VALUES ({art_piece_id}, {submitted_artist}, {submitted_title}, {submitted_date}, {submitted_description}, {submitted_summary});",
            getUnacceptededArt: "SELECT ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa  ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted = FALSE AND ap.owner_id = {owner_id} AND ap.section_id = {section_id};",
            getAcceptedArt: "SELECT ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted = TRUE AND ap.owner_id = {owner_id}  AND ap.section_id = {section_id};",
            getArtUndeterminedArt: "SELECT ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted IS NULL AND ap.owner_id = {owner_id}  AND ap.section_id = {section_id};",
            getUnsubmittedArt: "SELECT ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE NOT EXISTS (SELECT 1 FROM submissions AS s WHERE s.art_piece_id = ap.art_piece_id) AND ap.owner_id = {owner_id}  AND ap.section_id = {section_id};",
        };
        this.adminStatements = {
            addAcourse: "INSERT INTO courses (course_id) VALUES ({course_id});",
            addASection: "INSERT INTO sections (section_id, course_id,  section_session, section_start, section_end, section_admin) VALUES ({section_id}, {course_id},  {section_session}, {section_start}, {section_end}, {section_admin});",
            setAdminForSection: "UPDATE sections SET section_admin = {section_admin} WHERE section_id = {section_id};",
            viewAllStudentsInsection: "SELECT student_id FROM section_students WHERE section_id = {section_id};",
            setStudentFunds: "UPDATE section_students SET section_students_funds = {section_students_funds} WHERE student_id = {student_id} AND section_id = 'section_id';",
            giveStudentArt: "UPDATE art_pieces SET owner_id = {owner_id} WHERE art_piece_id = {art_piece_id};",
            droppingAStudent: `UPDATE section_students SET dropped = true WHERE student_id = {student_id} AND section_id = {section_id};
DELETE FROM submissions AS s INNER JOIN art_pieces AS ap ON s.art_piece_id = ap.art_piece_id WHERE ap.owner_id = {owner_id};
UPDATE art_pieces SET owner_id = null WHERE owner_id = {owner_id} AND section_id = {section_id};
DELETE FROM trades WHERE status IS NULL AND (tradee_id = {tradee_id } OR trader_id = {trader_id}) AND section_id = {section_id};`,
            acceptSubmissions: "UPDATE FROM submissions AS s INNER JOIN art_pieces AS ap ON s.art_piece_id = ap.art_piece_id SET s.submission_accepted = TRUE WHERE ap.owner_id = {owner_id};",
            declineSubmission: "UPDATE FROM submissions AS s INNER JOIN art_pieces AS ap ON s.art_piece_id = ap.art_piece_id SET s.submission_accepted = FALSE WHERE ap.owner_id = {owner_id};",
            getAllStudentsAndUnacceptedArt: "SELECT ap.owner_id, ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted = FALSE;",
            getAllStudentsAndAcceptedArt: "SELECT ap.owner_id, ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted = TRUE;",
            getAllStudentsAndWaitingArt: "SELECT ap.owner_id, ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN submissions AS s ON s.art_piece_id = ap.art_piece_id INNER JOIN source_art sa ON ap.source_art_id = sa.source_art_id WHERE s.submission_accepted IS NULL;",
            getAllStudentsAndUnsubmittedArt: "SELECT ap.owner_id, ap.art_piece_id, sa.large_location, sa.small_location FROM art_pieces AS ap INNER JOIN source_art sa  ON ap.source_art_id = sa.source_art_id WHERE NOT EXISTS (SELECT 1 FROM submissions AS s WHERE s.art_piece_id = ap.art_piece_id);",
            getAllArtInSection: "SELECT sa.large_location, sa.small_location, ap.art_piece_id FROM art_pieces AS ap INNER JOIN source_art sa  ON ap.source_art_id = sa.source_art_id WHERE AND ap.section_id = {section_id} AND sa.source_art_id;",
            getAllArtInCourse: "SELECT sa.large_location, sa.small_location FROM source_art AS sa INNER JOIN entered_art ea ON sa.source_art_id = ea.source_art_id WHERE ea.course_id = {course_id};",
            getAllUnownedArtSection: "SELECT ap.art_piece_id FROM art_pieces AS ap WHERE section_id = {section_id} AND owner_id IS NULL;",
            getAllArt: "SELECT large_location, small_location FROM source_art;"
        }
    }

    generatePreparedStatements(parsedJSON) {
        let statementContent = this.studentStatements[parsedJSON.statment];
        let currentRegEx;
        let prop;
        for (prop in parsedJSON.valuesObj) {
            currentRegEx = new RegExp("{" + prop + "}", 'g');
            statementContent.replace(currentRegEx, parsedJSON.valuesObj[prop]);
        }
        return statementContent;
    }

    processSQLRequest(parsedJSON, rdsdataservice) {
        let preparedSQL = this.generatePreparedStatements(parsedJSON);
        this.params.sqlStatements = preparedSQL;
        rdsdataservice.executeSql(
            this.params,
            function (err, data) {
                if (err === null) {
                    //write to log file
                } else if (data !== null) {
                    
                    //use data
                }
            }
        ).promise();
    }

}