# TheGreenRoom API Documentation

## Overview

TheGreenRoom API provides endpoints for artist profile management, pitch generation, outreach tracking, and authentication. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

## Authentication

Most endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token"
    }
  }
}
```

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userData": {
    "name": "Artist Name",
    "genre": "Jazz"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    }
  }
}
```

### Artist Profiles

#### GET /api/profiles
Get the current user's artist profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid",
    "artist_id": "user-uuid",
    "name": "Artist Name",
    "genre": "Jazz",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "email": "artist@example.com",
    "phone": "+1234567890",
    "website": "https://artist.com",
    "bio": "Artist bio...",
    "pricing": "$500-1000",
    "availability": "Weekends",
    "social_links": {
      "instagram": "https://instagram.com/artist",
      "spotify": "https://spotify.com/artist"
    },
    "press_kit_url": "https://example.com/press-kit",
    "sample_tracks": ["https://example.com/track1.mp3"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/profiles
Create or update the current user's artist profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Artist Name",
  "genre": "Jazz",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "email": "artist@example.com",
  "phone": "+1234567890",
  "website": "https://artist.com",
  "bio": "Artist bio...",
  "pricing": "$500-1000",
  "availability": "Weekends",
  "social_links": {
    "instagram": "https://instagram.com/artist",
    "spotify": "https://spotify.com/artist"
  },
  "press_kit_url": "https://example.com/press-kit",
  "sample_tracks": ["https://example.com/track1.mp3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid",
    "artist_id": "user-uuid",
    "name": "Artist Name",
    "genre": "Jazz",
    "city": "New York",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Pitches

#### GET /api/pitches
Get all pitches for the current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `sent`, `archived`)
- `limit` (optional): Number of pitches to return (default: 50)
- `offset` (optional): Number of pitches to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pitch-uuid",
      "artist_id": "user-uuid",
      "venue_name": "Blue Note",
      "venue_city": "New York",
      "venue_email": "booking@bluenote.com",
      "subject": "Booking Inquiry: Artist Name",
      "body": "Dear Blue Note,\n\nI would like to book a show...",
      "status": "draft",
      "sent_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/pitches
Create a new pitch.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "venue_name": "Blue Note",
  "venue_city": "New York",
  "venue_email": "booking@bluenote.com",
  "subject": "Booking Inquiry: Artist Name",
  "body": "Dear Blue Note,\n\nI would like to book a show..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pitch-uuid",
    "artist_id": "user-uuid",
    "venue_name": "Blue Note",
    "venue_city": "New York",
    "venue_email": "booking@bluenote.com",
    "subject": "Booking Inquiry: Artist Name",
    "body": "Dear Blue Note,\n\nI would like to book a show...",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/pitches/:id
Update an existing pitch.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "venue_name": "Updated Venue Name",
  "venue_city": "Updated City",
  "venue_email": "updated@venue.com",
  "subject": "Updated Subject",
  "body": "Updated body content..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pitch-uuid",
    "artist_id": "user-uuid",
    "venue_name": "Updated Venue Name",
    "venue_city": "Updated City",
    "venue_email": "updated@venue.com",
    "subject": "Updated Subject",
    "body": "Updated body content...",
    "status": "draft",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/pitches/:id
Delete a pitch.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pitch deleted successfully"
}
```

### AI Pitch Generation

#### POST /api/generate-pitch
Generate a pitch using AI based on artist profile and venue information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "venue_name": "Blue Note",
  "venue_city": "New York",
  "venue_email": "booking@bluenote.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Booking Inquiry: Artist Name - Jazz",
    "body": "Dear Blue Note,\n\nI hope this email finds you well. I'm reaching out to express my interest in performing at your esteemed venue...\n\nBest regards,\nArtist Name"
  }
}
```

### Outreach Tracking

#### GET /api/outreach/campaigns
Get all outreach campaigns for the current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign-uuid",
      "artist_id": "user-uuid",
      "name": "Spring 2024 Tour",
      "description": "Outreach campaign for spring tour dates",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/outreach/campaigns
Create a new outreach campaign.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Spring 2024 Tour",
  "description": "Outreach campaign for spring tour dates"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign-uuid",
    "artist_id": "user-uuid",
    "name": "Spring 2024 Tour",
    "description": "Outreach campaign for spring tour dates",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/outreach/emails
Get all outreach emails for the current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign ID
- `status` (optional): Filter by status (`draft`, `sent`, `delivered`, `opened`, `replied`, `bounced`)
- `limit` (optional): Number of emails to return (default: 50)
- `offset` (optional): Number of emails to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "email-uuid",
      "campaign_id": "campaign-uuid",
      "artist_id": "user-uuid",
      "venue_name": "Blue Note",
      "venue_email": "booking@bluenote.com",
      "venue_city": "New York",
      "venue_website": "https://bluenote.com",
      "subject": "Booking Inquiry: Artist Name",
      "body": "Dear Blue Note,\n\nI would like to book a show...",
      "status": "sent",
      "sent_at": "2024-01-01T00:00:00Z",
      "opened_at": "2024-01-01T01:00:00Z",
      "replied_at": null,
      "response_content": null,
      "response_type": null,
      "notes": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/outreach/emails
Create a new outreach email.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "campaign_id": "campaign-uuid",
  "venue_name": "Blue Note",
  "venue_email": "booking@bluenote.com",
  "venue_city": "New York",
  "venue_website": "https://bluenote.com",
  "subject": "Booking Inquiry: Artist Name",
  "body": "Dear Blue Note,\n\nI would like to book a show..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "email-uuid",
    "campaign_id": "campaign-uuid",
    "artist_id": "user-uuid",
    "venue_name": "Blue Note",
    "venue_email": "booking@bluenote.com",
    "venue_city": "New York",
    "venue_website": "https://bluenote.com",
    "subject": "Booking Inquiry: Artist Name",
    "body": "Dear Blue Note,\n\nI would like to book a show...",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/outreach/stats
Get outreach statistics for the current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign ID
- `start_date` (optional): Start date for statistics (ISO format)
- `end_date` (optional): End date for statistics (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_emails": 100,
    "sent_emails": 95,
    "opened_emails": 45,
    "replied_emails": 12,
    "response_rate": 12.6,
    "positive_responses": 8,
    "negative_responses": 4,
    "average_response_time": 2.5
  }
}
```

### Email Subscription

#### POST /api/subscribe
Subscribe an email address to the newsletter.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination using `limit` and `offset` query parameters. The response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

## Webhooks

TheGreenRoom supports webhooks for real-time notifications. Configure webhook endpoints in your account settings to receive notifications for:

- Email status changes (sent, delivered, opened, replied)
- Campaign status updates
- Profile changes

Webhook payloads include a signature header for verification:
```
X-TheGreenRoom-Signature: sha256=...
``` 