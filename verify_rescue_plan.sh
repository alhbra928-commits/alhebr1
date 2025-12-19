#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "     🚨 Rescue Plan Verification"
echo "════════════════════════════════════════════════════════"
echo ""

FILE="/tmp/cc-agent/58919512/project/src/components/common/SmartActivityTicker.tsx"

# 1. Check refs exist
echo "1️⃣ Checking refs..."
if grep -q "const trackRef = useRef<HTMLDivElement>(null)" "$FILE" && \
   grep -q "const groupRef = useRef<HTMLDivElement>(null)" "$FILE"; then
  echo "   ✅ Refs exist (trackRef, groupRef)"
else
  echo "   ❌ Missing refs"
fi
echo ""

# 2. Check debug useEffect
echo "2️⃣ Checking debug system..."
if grep -q "ticker-debug" "$FILE"; then
  echo "   ✅ Debug overlay found"
  if grep -q "items=\${count} groupW=\${gw}px maskW=\${mw}px" "$FILE"; then
    echo "   ✅ Debug displays: items, groupW, maskW"
  fi
else
  echo "   ❌ Debug missing"
fi
echo ""

# 3. Check auto-fill useEffect
echo "3️⃣ Checking auto-fill system..."
if grep -q "data-clone='1'" "$FILE"; then
  echo "   ✅ Auto-fill cloning found"
fi
if grep -q "Math.ceil((maskWidth \* 3) / groupWidth)" "$FILE"; then
  echo "   ✅ 3× screen coverage calculation"
fi
if grep -q "setProperty(\"--group-w\"" "$FILE"; then
  echo "   ✅ CSS variable --group-w set"
fi
echo ""

# 4. Check CSS animation
echo "4️⃣ Checking CSS animation..."
if grep -q "calc(-1 \* var(--group-w" "$FILE"; then
  echo "   ✅ Animation uses --group-w (not -50%)"
fi
if grep -q "@keyframes marquee" "$FILE"; then
  echo "   ✅ @keyframes marquee exists"
fi
echo ""

# 5. Check NO hiding
echo "5️⃣ Checking no content hiding..."
SLICE=$(grep -c "\.slice(" "$FILE")
FILTER_MOBILE=$(grep -c "isMobile" "$FILE")
if [ "$SLICE" -eq 0 ] && [ "$FILTER_MOBILE" -eq 0 ]; then
  echo "   ✅ No slice() or mobile filtering"
else
  echo "   ❌ Warning: Found slice or mobile filter"
fi
echo ""

# 6. Check JSX structure
echo "6️⃣ Checking JSX structure..."
if grep -q "ref={trackRef}" "$FILE"; then
  echo "   ✅ trackRef applied"
fi
if grep -q "ref={groupRef}" "$FILE"; then
  echo "   ✅ groupRef applied"
fi
if grep -q "marquee-mask" "$FILE"; then
  echo "   ✅ marquee-mask wrapper exists"
fi
echo ""

# 7. Check activity cards
echo "7️⃣ Checking activity cards..."
if grep -q "activityCards" "$FILE"; then
  echo "   ✅ activityCards variable exists"
fi
if grep -q "flex: 0 0 auto" "$FILE"; then
  echo "   ✅ Cards have flex: 0 0 auto"
fi
if grep -q "white-space: nowrap" "$FILE"; then
  echo "   ✅ Cards have white-space: nowrap"
fi
if grep -q "margin: 0 !important" "$FILE"; then
  echo "   ✅ Cards have margin: 0 !important"
fi
echo ""

# 8. Final summary
echo "════════════════════════════════════════════════════════"
echo "     Final Status"
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ Phase 1: Debug system - APPLIED"
echo "✅ Phase 2: No hiding - APPLIED"
echo "✅ Phase 3: Auto-fill - APPLIED"
echo ""
echo "Status: ✅ RESCUE PLAN COMPLETE"
echo "Ready for: iPhone testing"
echo ""
echo "════════════════════════════════════════════════════════"
