/* global describe it */
const fs = require('fs')
const path = require('path')

const boardModel = require('../../src/js/models/board')

const assert = require('assert')

const fixturesPath = path.join(__dirname, '..', 'fixtures')
const scene = JSON.parse(
  fs.readFileSync(
    path.join(fixturesPath, 'audio', 'audio.storyboarder')
  )
)
const shotGeneratorScene = JSON.parse(
  fs.readFileSync(
    path.join(fixturesPath, 'shot-generator', 'shot-generator.storyboarder')
  )
)

describe('boardModel', () => {
  describe('#getMediaDescription', () => {
    describe('when reading from scene data', () => {
      let board = scene.boards[0]
      let media = boardModel.getMediaDescription(board)
      it('lists media files', () => {
        assert(media.layers.reference.length)
        assert(media.layers.notes.length)
        assert(media.audio.length)
        assert(media.link === board.link)
      })
      it('excludes board.url', () => {
        assert(media.url == null)
      })
      it('includes link if present', () => {
        let boardWithLink = {
          ...board,
          link: 'board.psd'
        }
        let boardWithLinkMedia = boardModel.getMediaDescription(boardWithLink)
        assert(boardWithLinkMedia.link.length)
        assert(boardWithLinkMedia.link === boardWithLink.link)
      })
      it('does not include sg key for non-shot generator boards', () => {
        let board = scene.boards[0]
        let media = boardModel.getMediaDescription(board)
        assert(media.sg == null)
      })
      it('includes sg key for shot generator boards', () => {
        let board = shotGeneratorScene.boards[0]
        let media = boardModel.getMediaDescription(board)
        assert(media.sg != null)
      })
    })
    describe('edge cases', () => {
      // for old iPad app boards
      it('can handle a missing layers object', () => {
        let board = {
          ...scene.boards[0],
          layers: undefined
        }
        let media = boardModel.getMediaDescription(board)
        assert(Object.keys(media.layers).length === 0)
      })
      it('can handle a blank layers object', () => {
        let board = {
          ...scene.boards[0],
          layers: {}
        }
        let media = boardModel.getMediaDescription(board)
        assert(Object.keys(media.layers).length === 0)
      })
    })
  })
  describe('#getMediaFilenames', () => {
    describe('when reading from scene data', () => {
      let board = scene.boards[0]
      let filenames = boardModel.getMediaFilenames(board)
      it('lists media files', () => {
        assert(filenames.length === 5)
        assert(filenames.includes('board-1-1ABCD-reference.png'))
        assert(filenames.includes('1ABCD-audio-1234567890000.wav'))
      })

      it('includes sg files for shot generator boards', () => {
        let board = shotGeneratorScene.boards[0]
        let filenames = boardModel.getMediaFilenames(board)
        assert(filenames.includes('board-1-UDRF3-shot-generator-camera-plot.png'))
      })
    })
    describe('edge cases', () => {
      // for old iPad app boards
      it('can handle a missing layers object', () => {
        let board = {
          ...scene.boards[0],
          layers: undefined
        }
        let filenames = boardModel.getMediaFilenames(board)
        assert(filenames.length === 3)
        assert(!filenames.includes('board-1-1ABCD-reference.png'))
      })
      it('can handle a blank layers object', () => {
        let board = {
          ...scene.boards[0],
          layers: {}
        }
        let filenames = boardModel.getMediaFilenames(board)
        assert(filenames.length === 3)
        assert(!filenames.includes('board-1-1ABCD-reference.png'))
      })
    })
  })

  describe('shot generator layer and thumbnail', () => {
    const scene = JSON.parse(
      fs.readFileSync(
        path.join(fixturesPath, 'shot-generator', 'shot-generator.storyboarder')
      )
    )
    const board = scene.boards[0]

    describe('#getMediaDescription', () => {
      let media = boardModel.getMediaDescription(board)
      it('includes layerThumbnails', () => {
        assert(media.layerThumbnails['shot-generator'].length)
      })
    })
    describe('#getMediaFilenames', () => {
      let filenames = boardModel.getMediaFilenames(board)
      it('includes shot-generator layer thumbnail', () => {
        assert(
          filenames.includes('board-1-UDRF3-shot-generator-thumbnail.jpg'),
          'thumbnail should exist'
        )
      })
    })
  })
})
