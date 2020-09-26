.head on


PRAGMA table_info(Artist);
PRAGMA table_info(Album);
PRAGMA table_info(MediaType);
PRAGMA table_info(Genre);
PRAGMA table_info(Track);
-- PRAGMA table_info(PlaylistTrack);
-- PRAGMA table_info(Playlist);
PRAGMA table_info(Employee);
PRAGMA table_info(Customer);
PRAGMA table_info(Invoice);
PRAGMA table_info(InvoiceLine);

DROP VIEW IF EXISTS TrackList;
CREATE VIEW TrackList AS
SELECT PlaylistTrack.PlaylistId,TrackId,Name
FROM PlaylistTrack
INNER JOIN Playlist on PlaylistTrack.PlaylistId = Playlist.PlaylistId;

DROP VIEW IF EXISTS ListTrack;
CREATE VIEW ListTrack AS
SELECT PlaylistId,Track.TrackId,Name,AlbumId,MediaTypeId,GenreId,Composer,Milliseconds,Bytes,UnitPrice
FROM PlaylistTrack
INNER JOIN Track on Track.TrackId = PlaylistTrack.TrackId;

PRAGMA table_info(TrackList);
PRAGMA table_info(ListTrack);

