import { useState, useEffect } from 'react'

const PerformanceMonitor = ({ gameEngine }) => {
  const [stats, setStats] = useState({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0,
    optimizationMode: 'Unknown'
  })

  useEffect(() => {
    if (!gameEngine) return

    const interval = setInterval(() => {
      const newStats = {
        fps: Math.round(gameEngine.currentFPS || 0),
        drawCalls: 0,
        triangles: 0,
        memoryUsage: 0,
        optimizationMode: gameEngine.optimizedWorldRenderer ? 'Optimized' : 'Enhanced'
      }

      // Get performance stats from optimized renderer if available
      if (gameEngine.optimizedWorldRenderer) {
        const perfStats = gameEngine.optimizedWorldRenderer.getPerformanceStats()
        newStats.drawCalls = perfStats.drawCalls
        newStats.triangles = perfStats.triangles
        newStats.culledObjects = perfStats.culledObjects
        newStats.loadedChunks = perfStats.loadedChunks
        newStats.instancedMeshes = perfStats.instancedMeshes
      }

      // Get renderer info
      if (gameEngine.renderer && gameEngine.renderer.info) {
        newStats.drawCalls = gameEngine.renderer.info.render.calls
        newStats.triangles = gameEngine.renderer.info.render.triangles
      }

      setStats(newStats)
    }, 500) // Update every 500ms

    return () => clearInterval(interval)
  }, [gameEngine])

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-400'
    if (value <= thresholds.medium) return 'text-yellow-400'
    return 'text-red-400'
  }

  const fpsColor = getPerformanceColor(60 - stats.fps, { good: 10, medium: 25 })
  const drawCallColor = getPerformanceColor(stats.drawCalls, { good: 20, medium: 50 })

  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-20 min-w-[200px]">
      <div className="text-center font-bold mb-2 text-blue-400">
        Performance Monitor
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className={stats.optimizationMode === 'Optimized' ? 'text-green-400' : 'text-yellow-400'}>
            {stats.optimizationMode}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fpsColor}>{stats.fps}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Draw Calls:</span>
          <span className={drawCallColor}>{stats.drawCalls}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Triangles:</span>
          <span className="text-blue-400">{stats.triangles?.toLocaleString()}</span>
        </div>

        {stats.optimizationMode === 'Optimized' && (
          <>
            <hr className="border-gray-600 my-2" />
            <div className="text-center text-xs text-gray-400 mb-1">Optimizations</div>
            
            {stats.instancedMeshes !== undefined && (
              <div className="flex justify-between">
                <span>Instanced:</span>
                <span className="text-green-400">{stats.instancedMeshes}</span>
              </div>
            )}
            
            {stats.culledObjects !== undefined && (
              <div className="flex justify-between">
                <span>Culled:</span>
                <span className="text-purple-400">{stats.culledObjects}</span>
              </div>
            )}
            
            {stats.loadedChunks !== undefined && (
              <div className="flex justify-between">
                <span>Chunks:</span>
                <span className="text-cyan-400">{stats.loadedChunks}</span>
              </div>
            )}
          </>
        )}
        
        <hr className="border-gray-600 my-2" />
        <div className="text-center">
          <div className="text-xs text-gray-400">Benefits</div>
          {stats.optimizationMode === 'Optimized' ? (
            <div className="space-y-0.5 text-xs">
              <div className="text-green-400">✓ Instanced Rendering</div>
              <div className="text-green-400">✓ Frustum Culling</div>
              <div className="text-green-400">✓ Model Optimization</div>
              <div className="text-green-400">✓ 90% Less Geometry</div>
            </div>
          ) : (
            <div className="text-yellow-400 text-xs">
              Enhanced Mode Active
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor