import React, { useEffect, useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Paper, IconButton } from '@material-ui/core';
import { PlayArrow, Pause, Favorite, Add } from '@material-ui/icons';
import ReactPlayer from 'react-player';

import { listSongs } from '../../graphql/queries';
import { updateSong } from '../../graphql/mutations';

import AddSong from '../AddSong';

const SongList = () => {
  const [songs, setSongs] = useState([]); // eslint-disable-line
  const [songPlaying, setSongPlaying] = useState('');
  const [audioURL, setAudioURL] = useState(''); // eslint-disable-line
  const [showAddSong, setShowAddNewSong] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleSong = async (idx) => {
    if (songPlaying === idx) {
      setSongPlaying('');
      return;
    }

    const songFilePath = songs[idx].filepath;
    try {
      const fileAccessURL = await Storage.get(songFilePath, { expires: 60 });
      // console.log('fileAccessURL', fileAccessURL)

      setSongPlaying(idx);
      setAudioURL(fileAccessURL);
      return;
    } catch (error) {
      console.error('error on accessing the file from s3', error);
      setAudioURL('');
      setSongPlaying('');
    }
  }
  
  const fetchSongs = async() => {
    try {
      const songData = await API.graphql(graphqlOperation(listSongs));
      const songList = songData.data.listSongs.items;
      // console.log('song list', songList);

      setSongs(songList);
    } catch (error) {
      console.error('error on feching songs', error);
    }
  }

  const addLike = async(idx) => {
    try {
      const song = songs[idx];
      song.like = song.like + 1;
      delete song.createdAt;
      delete song.updatedAt;

      const songData = await API.graphql(graphqlOperation(updateSong, { input: song }));
      const songList = [...songs];
      songList[idx] = songData.data.updateSong;
      setSongs(songList);

    } catch (error) {
      console.error('error on adding like to song', error);
    }
  }

  return (
    <div className="songList">
      {
        songs.map((song, idx) => {
          return (
            <Paper key={ song.id } variant="outlined" elevation={2}>
              <div className="songCard">
                <IconButton aria-label="play" onClick={() => toggleSong(idx)}>
                  {
                    songPlaying === idx ? <Pause /> : <PlayArrow />
                  }
                </IconButton>
                <div>
                  <div className="songTitle">{ song.title }</div>
                  <div className="songOwner">{ song.owner }</div>
                </div>
                <div>
                  <IconButton aria-label="like" onClick={ () => addLike(idx) }>
                    <Favorite />
                  </IconButton>
                  { song.like }
                </div>
                <div className="songDescription">{ song.description }</div>
              </div>
              {
                songPlaying === idx && (
                  <div className="audioPlayer">
                    <ReactPlayer
                      url={audioURL}
                      controls
                      playing
                      height="50px"
                      onPause={() => toggleSong(idx)}
                    />
                  </div>
                )
              }
            </Paper>
          )
        })
      }
      {
        showAddSong ? (
          <AddSong onUpload={() => {
            setShowAddNewSong(false)
            fetchSongs()
          }}/>
        ) : <IconButton onClick={() => setShowAddNewSong(true)}><Add /></IconButton>
      }
    </div>
  );
};

export default SongList;
