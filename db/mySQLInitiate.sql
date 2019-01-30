CREATE DATABASE fac_test;

USE fac_test;

CREATE TABLE submissions (   
    submission_id INT UNSIGNED AUTO_INCREMENT,
    art_piece_id INT UNSIGNED,
    submission_accepted BOOLEAN,
    submitted_artist VARCHAR(200),
    submitted_title VARCHAR(200),
    submitted_date VARCHAR(200),
    submitted_description VARCHAR(2000),
    submitted_summary VARCHAR(2000),
    CONSTRAINT pk_submission_id PRIMARY KEY (submission_id)
    -- CONSTRAINT fk_art_piece_id FOREIGN KEY (art_piece_id)
        -- REFERENCES art_pieces (art_piece_id)
);

CREATE TABLE courses (  
	course_id VARCHAR(60),
     	CONSTRAINT course_id PRIMARY KEY (course_id)
);

CREATE TABLE sections (
     section_id SMALLINT UNSIGNED AUTO_INCREMENT,
     course_id VARCHAR(60),
     section_num VARCHAR(60),
     section_session VARCHAR(60),
     section_start DATE,
     section_end DATE,
     section_admin VARCHAR(60),
     CONSTRAINT pk_section_id PRIMARY KEY (section_id)
     -- CONSTRAINT fk_course_id FOREIGN KEY (course_id)
        -- REFERENCES courses (course_id)
     -- CONSTRAINT fk_section_admin FOREIGN KEY (section_admin)
        -- REFERENCES students (student_id)
);

CREATE TABLE students (
     student_id VARCHAR(60),
     CONSTRAINT pk_student_id PRIMARY KEY (student_id)
);

CREATE TABLE trades (
     trade_id INT UNSIGNED AUTO_INCREMENT,
     payment INT UNSIGNED,
     status ENUM('a', 'd'),
     trader_id VARCHAR(60),
     tradee_id VARCHAR(60),
     section_id SMALLINT UNSIGNED,
     CONSTRAINT pk_trade_id PRIMARY KEY (trade_id)
     -- CONSTRAINT fk_trader_id FOREIGN KEY (trader_id)
        -- REFERENCES students (student_id),
     -- CONSTRAINT fk_tradee_id FOREIGN KEY (tradee_id)
        -- REFERENCES students (student_id),
     -- CONSTRAINT fk_section_id FOREIGN KEY (section_id)
        -- REFERENCES sections (section_id)
);

CREATE TABLE source_art (
    source_art_id INT UNSIGNED AUTO_INCREMENT,
    -- S3 locations
    large_location VARCHAR(200),
    small_location VARCHAR(200),
    CONSTRAINT source_art_id PRIMARY KEY (source_art_id)
);

CREATE TABLE art_pieces (
    art_piece_id INT UNSIGNED AUTO_INCREMENT,
    owner_id VARCHAR(60),
    admin_assigned_value INT UNSIGNED,
    section_id  SMALLINT UNSIGNED,
    trade_id INT UNSIGNED,
    source_art_id INT UNSIGNED,
    CONSTRAINT pk_artpiece_id PRIMARY KEY(art_piece_id)
     -- CONSTRAINT owner_id FOREIGN KEY(student_id)
        -- REFERENCES students (student_id),
     -- CONSTRAINT fk_section_id FOREIGN KEY(section_id)
        -- REFERENCES sections (section_id)*/
);



-- fix the "chicken and egg"
ALTER TABLE submissions ADD CONSTRAINT fk_art_piece_id FOREIGN KEY (art_piece_id)
        REFERENCES art_pieces (art_piece_id);
        
ALTER TABLE sections ADD CONSTRAINT fk_section_admin FOREIGN KEY (section_admin)
        REFERENCES students (student_id),
	ADD CONSTRAINT fk_course_id FOREIGN KEY (course_id)
        REFERENCES courses (course_id);
        
ALTER TABLE trades ADD CONSTRAINT fk_trader_id FOREIGN KEY (trader_id)
         REFERENCES students (student_id),
     ADD CONSTRAINT fk_tradee_id FOREIGN KEY (tradee_id)
         REFERENCES students (student_id),
     ADD CONSTRAINT fk_section_id FOREIGN KEY (section_id)
         REFERENCES sections (section_id);

ALTER TABLE art_pieces ADD CONSTRAINT fk_student_id_ap FOREIGN KEY (owner_id)
        REFERENCES students (student_id),
     ADD CONSTRAINT fk_section_id_ap FOREIGN KEY(section_id)
        REFERENCES sections (section_id),
     ADD CONSTRAINT fk_source_art_id_ap FOREIGN KEY(source_art_id)
        REFERENCES source_art (source_art_id);

CREATE TABLE entered_art (
    course_id VARCHAR(60),
    source_art_id INT UNSIGNED,
    CONSTRAINT fk_course_id_ea FOREIGN KEY (course_id)
        REFERENCES courses (course_id),
    CONSTRAINT fk_source_art_id_ea FOREIGN KEY (source_art_id)
        REFERENCES source_art (source_art_id)
);

CREATE TABLE section_students (
    section_id SMALLINT UNSIGNED,
    funds INT UNSIGNED,
    student_id VARCHAR (60),
    dropped BOOLEAN,
    CONSTRAINT fk_section_id_stu FOREIGN KEY (section_id)
        REFERENCES sections (section_id),
    CONSTRAINT fk_student_id FOREIGN KEY (student_id)
        REFERENCES students (student_id)
);