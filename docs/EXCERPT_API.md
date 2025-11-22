# GET /excerpt_with_alignment Endpoint

## Description
This endpoint provides Bible excerpt text along with alignment data for audio. It allows retrieving one or more excerpts with the ability to link to a specific voice.

## Query Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| translation | integer | Yes | Bible translation code | 1 |
| excerpt | string | Yes | String specifying the excerpt in format "book chapter[:verse[-verse]]" | "gen 1", "gen 1:1-3" |
| voice | integer | No | Voice code for retrieving alignment data | 5 |

## Excerpt Parameter Formats

* `"gen 1"` - entire first chapter of Genesis
* `"gen 1:1"` - only the first verse of the first chapter of Genesis
* `"gen 1:1-5"` - verses 1 to 5 of the first chapter of Genesis
* `"gen 1 ex 20"` - multiple excerpts (Genesis chapter 1 and Exodus chapter 20)

## Response Structure

```json
{
  "title": "Genesis 1",
  "is_single_chapter": true,
  "parts": [
    {
      "book": {
        "code": 123,
        "number": 1,
        "alias": "gen",
        "name": "Genesis",
        "chapters_count": 50
      },
      "chapter_number": 1,
      "audio_link": "https://example.com/audio/syn/gen/01.mp3",
      "prev_excerpt": "",
      "next_excerpt": "gen 2",
      "verses": [
        {
          "code": 456,
          "number": 1,
          "join": 0,
          "text": "In the beginning God created the heaven and the earth.",
          "html": "<p>In the beginning God created the heaven and the earth.</p>",
          "begin": 0.0,
          "end": 4.25,
          "start_paragraph": true
        }
      ],
      "notes": [
        {
          "code": 789,
          "number": 1,
          "text": "Note to text",
          "verse_code": 456,
          "title_code": null,
          "position_text": 10,
          "position_html": 15
        }
      ],
      "titles": [
        {
          "code": 321,
          "text": "Creation of the World",
          "before_verse_code": 456,
          "metadata": null,
          "reference": null
        }
      ]
    }
  ]
}
```

## Main Response Fields

* **title** - excerpt title
* **is_single_chapter** - flag indicating if the excerpt is a single chapter
* **parts** - array of excerpt parts (for each requested chapter)

## Excerpt Part Fields (parts)

* **book** - book information (code, number, name, alias, chapter count)
* **chapter_number** - chapter number
* **audio_link** - link to audio file
* **prev_excerpt** - link to previous excerpt (in "book chapter" format)
* **next_excerpt** - link to next excerpt (in "book chapter" format)
* **verses** - array of verses with alignment data
* **notes** - array of text notes
* **titles** - array of text titles

## Verse Fields (verses)

* **code** - unique verse code
* **number** - verse number
* **join** - verse number to join with (if verses are merged)
* **text** - verse text without HTML
* **html** - verse text with HTML
* **begin** - verse start time in audio file (in seconds)
* **end** - verse end time in audio file (in seconds)
* **start_paragraph** - paragraph start flag

## Error Codes

* **422** - Parameter validation error:
  * Translation not found
  * Voice not found for specified translation
  * Invalid excerpt format
  * Book not found
  * Verses not found for specified excerpt

## Example Requests

1. Get Genesis chapter 1 with audio:
   ```
   GET /excerpt_with_alignment?translation=1&excerpt=gen%201&voice=5
   ```

2. Get verses 1-3 from Genesis chapter 1:
   ```
   GET /excerpt_with_alignment?translation=1&excerpt=gen%201:1-3&voice=5
   ```

3. Get multiple excerpts:
   ```
   GET /excerpt_with_alignment?translation=1&excerpt=gen%201%20ex%2020&voice=5
   ```
