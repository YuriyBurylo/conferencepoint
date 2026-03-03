
CREATE TABLE new_conferences (
    conference_id serial PRIMARY KEY,
	conference_status varchar(128),
    title text,
    venue varchar(128),
	country varchar(128),
    timing date,
    leaflet bytea
);

CREATE TABLE archive_conferences (
    conference_id serial PRIMARY KEY,
	conference_status varchar(128),
    title text,
    venue varchar(128),
	country varchar(128),
    timing date,
    participants text[],
    textpdf bytea
);