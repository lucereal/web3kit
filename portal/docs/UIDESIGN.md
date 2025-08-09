# UI DESIGN

## Explore (Home)
```
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO        Explore  Create  Dashboard  Activity        [Sepolia●] [◎] │
├───────────────────────────────────────────────────────────────────────┤
│  [Search…] [Price ▾] [Seller ▾] [Status ▾]        124 resources       │
│                                                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │
│  │ ResourceCard  │  │ ResourceCard  │  │ ResourceCard  │  …           │
│  │ • Name        │  │ • Name        │  │ • Name        │              │
│  │ • Desc…       │  │ • Desc…       │  │ • Desc…       │              │
│  │ • Ξ 0.02      │  │ • Ξ 0.10      │  │ • Ξ 0.05      │              │
│  │ [View] [Buy]  │  │ [View] [Buy]  │  │ [View] [Buy]  │              │
│  └───────────────┘  └───────────────┘  └───────────────┘              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Resource Detail
```
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO        Explore  Create  Dashboard  Activity        [Sepolia●] [◎] │
├───────────────────────────────────────────────────────────────────────┤
│ Title of Resource                                      Seller: 0x…AB  │
│ Short description…                                                         │
│ [Ξ 0.02]                                     [ Buy Access ] (primary) │
│ [Copy link] [View seller] [Open in block explorer]                      │
│                                                                       │
│ ┌─────────────────────┐   ┌─────────────────────────────────────────┐ │
│ │  Details            │   │  Activity (this resource)               │ │
│ │ • Created block #   │   │  • NewResource by 0x… at 10:42          │ │
│ │ • Sales count       │   │  • AccessPurchased by 0x… tx 0x…        │ │
│ │ • External URL      │   │  • WithdrawEarnings by 0x…              │ │
│ │ • Last updated      │   │  [ Show raw logs ]                      │ │
│ └─────────────────────┘   └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

### Create Resource
```
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO        Explore  Create  Dashboard  Activity        [Sepolia●] [◎] │
├───────────────────────────────────────────────────────────────────────┤
│  Name [________________________]                                       │
│  Description [_______________________________]                         │
│  Price (ETH) [____]   External URL (opt) [_______________]             │
│  [ List Resource ] (primary)           [ Reset ]                       │
│                                                                       │
│  Preview →  ┌──────────────────────────────┐                           │
│             │ ResourceCard                 │                           │
│             │ • Name                       │                           │
│             │ • Desc…                      │                           │
│             │ • Ξ 0.xx                     │                           │
│             │ [View] [Buy]                 │                           │
│             └──────────────────────────────┘                           │
└───────────────────────────────────────────────────────────────────────┘
```

## Dashboard
```
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO        Explore  Create  Dashboard  Activity        [Sepolia●] [◎] │
├───────────────────────────────────────────────────────────────────────┤
│  Tabs: [ My Resources ] [ Purchases ] [ Earnings ] [ Activity ]        │
│                                                                       │
│  My Resources                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ #  Name          Price   Sales   Status   Actions                 │ │
│  │ 1  API Foo       Ξ0.02   12      Active   [View] [Edit]           │ │
│  │ 2  Dataset Bar   Ξ0.10   3       Active   [View] [Deactivate]     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Earnings                                                              │
│  Current withdrawable: Ξ0.36     Lifetime: Ξ1.24   Last: 2d ago        │
│  [ Withdraw to my wallet ] (primary)                                  │
└───────────────────────────────────────────────────────────────────────┘
```

# Global Activity
```
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO        Explore  Create  Dashboard  Activity        [Sepolia●] [◎] │
├───────────────────────────────────────────────────────────────────────┤
│  Filters: [Type ▾] [Actor ▾] [Resource ▾] [Time ▾]  [ Show raw logs ] │
│                                                                       │
│  • NewResource  resource #12  by 0x… at 10:42   [tx 0x…] [block 62…]   │
│  • AccessPurchased  #12 by 0x… Ξ0.02   [tx 0x…]                         │
│  • WithdrawEarnings by 0x… Ξ0.36        [tx 0x…]                        │
└───────────────────────────────────────────────────────────────────────┘
```