# DATABASE_SCHEMA.md

# Tech & Tune

## Backend Database Schema

Version: 1.0

Database: PostgreSQL

ORM: Prisma

Architecture: Modular Relational Database

---

# Core Modules

```
Authentication
Users
Roles
Permissions

Products
Categories
Brands
Product Images
Specifications
Inventory

Orders
Order Items
Payments

Shopping Cart
Wishlist

Addresses

Quotes

Rentals

Service Requests

Reviews

Blog

Projects

Testimonials

FAQs

Coupons

Notifications

Media Library

Settings

Audit Logs
```

---

# Authentication Module

## User

```
id (UUID)

firstName

lastName

email

phone

password

avatar

roleId

isEmailVerified

status

lastLogin

createdAt

updatedAt
```

Relationship

```
User

├── Orders

├── Addresses

├── Wishlist

├── Reviews

├── Quotes

├── Rentals

├── Service Requests
```

---

# Roles

```
id

name

description
```

Example

```
Super Admin

Admin

Customer

Sales Manager

Engineer

Dealer
```

---

# Permissions

```
id

name

module

action
```

---

# Product Module

## Category

```
id

name

slug

description

image

parentId

seoTitle

seoDescription

status
```

Supports unlimited nested categories.

---

## Brand

```
id

name

slug

logo

country

website

description

status
```

Example

```
Perkins

Cummins

John Deere
```

---

## Product

```
id

name

slug

sku

categoryId

brandId

price

salePrice

costPrice

stock

minimumStock

kva

fuelType

generatorType

engineModel

alternator

voltage

frequency

phase

fuelTankCapacity

fuelConsumption

runtime

weight

dimensions

noiseLevel

warranty

description

shortDescription

featured

published

status

createdAt

updatedAt
```

---

## Product Images

```
id

productId

url

altText

sortOrder
```

Unlimited images.

---

## Product Specifications

```
id

productId

title

value
```

Example

```
Engine

Perkins 1106A

Frequency

50Hz

Voltage

400V
```

Unlimited specifications.

---

# Inventory

```
id

productId

warehouse

quantity

reserved

available

reorderLevel

updatedAt
```

---

# Shopping Module

## Cart

```
id

userId

createdAt
```

---

## Cart Item

```
id

cartId

productId

quantity

price
```

---

## Wishlist

```
id

userId

productId
```

---

# Order Module

## Order

```
id

userId

orderNumber

status

subtotal

discount

shipping

tax

total

paymentStatus

paymentMethod

billingAddressId

shippingAddressId

notes

createdAt
```

Status

```
Pending

Confirmed

Processing

Shipped

Delivered

Cancelled

Refunded
```

---

## Order Item

```
id

orderId

productId

quantity

price
```

---

# Payment

```
id

orderId

provider

transactionId

amount

currency

status

paidAt
```

Supports

```
Bank Transfer

Cash

JazzCash

Easypaisa

Stripe

PayPal
```

---

# Customer Address

```
id

userId

fullName

phone

country

province

city

postalCode

address

isDefault
```

---

# Quote Module

```
id

name

company

email

phone

city

generatorType

requiredKVA

brandPreference

purchaseType

budget

installationRequired

message

attachment

status

assignedTo

createdAt
```

Status

```
Pending

Contacted

Quoted

Approved

Rejected
```

---

# Rental Module

```
id

customerId

productId

rentalStart

rentalEnd

location

installationRequired

transportRequired

status

price

notes
```

---

# Service Request Module

```
id

customerId

generatorBrand

generatorModel

serialNumber

problem

priority

preferredDate

address

attachments

assignedEngineer

status

createdAt
```

Priority

```
Low

Medium

High

Emergency
```

---

# Reviews

```
id

productId

customerId

rating

title

review

images

status

createdAt
```

---

# Blog

```
id

title

slug

excerpt

content

coverImage

authorId

categoryId

published

publishedAt

seoTitle

seoDescription
```

---

# Blog Category

```
id

name

slug
```

---

# Projects

```
id

title

slug

client

location

generatorBrand

generatorCapacity

completionDate

description

images
```

---

# Testimonials

```
id

customerName

company

designation

rating

message

photo

published
```

---

# FAQ

```
id

question

answer

category

sortOrder
```

---

# Coupon

```
id

code

discountType

value

minimumOrder

startDate

endDate

usageLimit

status
```

---

# Notifications

```
id

userId

title

message

type

isRead

createdAt
```

---

# Media Library

```
id

fileName

url

type

size

uploadedBy

createdAt
```

---

# Website Settings

```
Company Name

Logo

Favicon

Phone

WhatsApp

Email

Address

Social Links

SEO Defaults

Analytics IDs
```

---

# Audit Log

```
id

userId

action

module

oldValue

newValue

ipAddress

createdAt
```

---

# Relationships

```
User
│
├── Orders
│      └── Order Items
│             └── Product
│
├── Addresses
│
├── Wishlist
│
├── Reviews
│
├── Quotes
│
├── Rentals
│
└── Service Requests

Category
│
└── Products
       │
       ├── Brand
       ├── Images
       ├── Specifications
       ├── Inventory
       ├── Reviews
       └── Order Items

Blog Category
│
└── Blogs
```

---

# Indexes

Create indexes on:

- email
- phone
- slug
- sku
- orderNumber
- productId
- categoryId
- brandId
- createdAt
- status
- paymentStatus

---

# Future Expansion

The schema is designed to support:

- Multi-vendor marketplace
- Multiple warehouses
- Dealer management
- ERP integration
- CRM integration
- Inventory synchronization
- Service engineer tracking
- Warranty management
- Rental fleet management
- Mobile applications
- AI recommendations
- Advanced reporting
- Business intelligence dashboards

---

# Design Principles

- UUID primary keys
- Foreign key constraints
- Soft deletes where appropriate
- Timestamps on all entities
- Optimized indexing
- Normalized data model
- Extensible relationships
- Secure role-based access control
- Prisma-friendly naming conventions
- Enterprise-ready architecture
